/**
 * Cloudflare Access verification for the admin API.
 *
 * Access already blocks unauthenticated requests at the edge, but the Worker
 * is also reachable on *.workers.dev and through misconfigured routes, so every
 * admin request re-verifies the Access JWT here. Fails closed: without
 * ACCESS_TEAM_DOMAIN + ACCESS_AUD nothing is allowed.
 */
import { type AdminEnv, HttpError } from "./env";

interface Jwk extends JsonWebKey {
	kid?: string;
}

interface AccessClaims {
	aud?: string | string[];
	email?: string;
	exp?: number;
	iss?: string;
	nbf?: number;
}

const certCache = new Map<string, { at: number; keys: Jwk[] }>();
const CERT_TTL_MS = 60 * 60 * 1000;

function b64urlToBytes(input: string): Uint8Array<ArrayBuffer> {
	const b64 = input
		.replace(/-/g, "+")
		.replace(/_/g, "/")
		.padEnd(Math.ceil(input.length / 4) * 4, "=");
	const bin = atob(b64);
	return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function decodePart<T>(part: string): T {
	return JSON.parse(new TextDecoder().decode(b64urlToBytes(part))) as T;
}

/** accepts "team", "team.cloudflareaccess.com" or "https://team.cloudflareaccess.com/..." */
export function normalizeTeamDomain(domain: string): string {
	const host = domain
		.trim()
		.replace(/^https?:\/\//, "")
		.replace(/\/.*$/, "")
		.toLowerCase();
	return host.includes(".") ? host : `${host}.cloudflareaccess.com`;
}

/** ACCESS_AUD may list several application AUD tags separated by commas */
export function parseAudiences(value: string): string[] {
	return value
		.split(/[\s,]+/)
		.map((a) => a.trim())
		.filter(Boolean);
}

async function getCerts(team: string, fetcher: typeof fetch, force = false): Promise<Jwk[]> {
	const cached = certCache.get(team);
	if (!force && cached && Date.now() - cached.at < CERT_TTL_MS) return cached.keys;
	const res = await fetcher(`https://${team}/cdn-cgi/access/certs`);
	if (!res.ok) throw new HttpError(502, "access_certs_unavailable");
	const body = (await res.json()) as { keys?: Jwk[] };
	const keys = body.keys ?? [];
	certCache.set(team, { at: Date.now(), keys });
	return keys;
}

function readToken(request: Request): string | null {
	const header = request.headers.get("Cf-Access-Jwt-Assertion");
	if (header) return header;
	const cookie = request.headers.get("Cookie") ?? "";
	const match = cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/);
	return match?.[1] ?? null;
}

/** verifies the Access JWT and returns the signed-in email */
export async function requireAdmin(
	request: Request,
	env: AdminEnv,
	fetcher: typeof fetch = fetch,
	now: number = Date.now(),
): Promise<{ email: string }> {
	if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
		throw new HttpError(
			503,
			"access_not_configured",
			"Cloudflare Access chưa được cấu hình cho CMS.",
		);
	}
	const token = readToken(request);
	if (!token) {
		throw new HttpError(
			401,
			"unauthenticated",
			"Request tới /api/admin không mang token của Cloudflare Access: đường dẫn /api/admin chưa nằm trong Access application.",
		);
	}

	const parts = token.split(".");
	if (parts.length !== 3) throw new HttpError(401, "invalid_token");
	const [h, p, s] = parts as [string, string, string];

	let header: { alg?: string; kid?: string };
	let claims: AccessClaims;
	try {
		header = decodePart(h);
		claims = decodePart(p);
	} catch {
		throw new HttpError(401, "invalid_token");
	}
	if (header.alg !== "RS256" || !header.kid) throw new HttpError(401, "invalid_token");

	const team = normalizeTeamDomain(env.ACCESS_TEAM_DOMAIN);
	let keys = await getCerts(team, fetcher);
	let jwk = keys.find((k) => k.kid === header.kid);
	if (!jwk) {
		// keys rotate: refresh once before giving up
		keys = await getCerts(team, fetcher, true);
		jwk = keys.find((k) => k.kid === header.kid);
	}
	if (!jwk) {
		throw new HttpError(
			401,
			"unknown_key",
			"Token được ký bởi team Access khác: kiểm tra ACCESS_TEAM_DOMAIN.",
		);
	}

	const key = await crypto.subtle.importKey(
		"jwk",
		jwk,
		{ hash: "SHA-256", name: "RSASSA-PKCS1-v1_5" },
		false,
		["verify"],
	);
	const valid = await crypto.subtle.verify(
		"RSASSA-PKCS1-v1_5",
		key,
		b64urlToBytes(s),
		new TextEncoder().encode(`${h}.${p}`),
	);
	if (!valid)
		throw new HttpError(
			401,
			"bad_signature",
			"Chữ ký token không hợp lệ: kiểm tra ACCESS_TEAM_DOMAIN.",
		);

	const nowSec = Math.floor(now / 1000);
	const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
	const allowedAud = parseAudiences(env.ACCESS_AUD);
	if (!audiences.some((a) => typeof a === "string" && allowedAud.includes(a))) {
		throw new HttpError(
			401,
			"wrong_audience",
			"Token thuộc Access application khác: ACCESS_AUD phải là Application Audience (AUD) Tag của application bảo vệ /admin và /api/admin (nhiều AUD thì phân cách bằng dấu phẩy).",
		);
	}
	if (normalizeTeamDomain(claims.iss ?? "") !== team) {
		throw new HttpError(
			401,
			"wrong_issuer",
			"Token do team Access khác cấp: kiểm tra ACCESS_TEAM_DOMAIN.",
		);
	}
	if (!claims.exp || claims.exp < nowSec)
		throw new HttpError(401, "expired", "Phiên Cloudflare Access đã hết hạn.");
	if (claims.nbf && claims.nbf > nowSec + 60) throw new HttpError(401, "not_yet_valid");

	const email = (claims.email ?? "").toLowerCase();
	if (!email)
		throw new HttpError(403, "no_email", "Token không có email (service token chưa được hỗ trợ).");
	const allow = (env.ADMIN_EMAILS ?? "")
		.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	if (allow.length && !allow.includes(email)) {
		throw new HttpError(403, "not_allowed", `${email} không có trong ADMIN_EMAILS.`);
	}
	return { email };
}

/** state-changing requests must come from the CMS page itself */
export function requireSameOrigin(request: Request) {
	if (request.method === "GET" || request.method === "HEAD") return;
	const origin = request.headers.get("Origin");
	if (!origin || origin !== new URL(request.url).origin) throw new HttpError(403, "bad_origin");
	if (request.headers.get("X-CMS-Request") !== "1") throw new HttpError(403, "missing_csrf_header");
}
