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

export function normalizeTeamDomain(domain: string): string {
	return domain
		.replace(/^https?:\/\//, "")
		.replace(/\/+$/, "")
		.toLowerCase();
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
	if (!token) throw new HttpError(401, "unauthenticated");

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
	if (!jwk) throw new HttpError(401, "unknown_key");

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
	if (!valid) throw new HttpError(401, "bad_signature");

	const nowSec = Math.floor(now / 1000);
	const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
	if (!audiences.includes(env.ACCESS_AUD)) throw new HttpError(401, "wrong_audience");
	if (claims.iss !== `https://${team}`) throw new HttpError(401, "wrong_issuer");
	if (!claims.exp || claims.exp < nowSec) throw new HttpError(401, "expired");
	if (claims.nbf && claims.nbf > nowSec + 60) throw new HttpError(401, "not_yet_valid");

	const email = (claims.email ?? "").toLowerCase();
	if (!email) throw new HttpError(403, "no_email");
	const allow = (env.ADMIN_EMAILS ?? "")
		.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	if (allow.length && !allow.includes(email)) throw new HttpError(403, "not_allowed");
	return { email };
}

/** state-changing requests must come from the CMS page itself */
export function requireSameOrigin(request: Request) {
	if (request.method === "GET" || request.method === "HEAD") return;
	const origin = request.headers.get("Origin");
	if (!origin || origin !== new URL(request.url).origin) throw new HttpError(403, "bad_origin");
	if (request.headers.get("X-CMS-Request") !== "1") throw new HttpError(403, "missing_csrf_header");
}
