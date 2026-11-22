/**
 * Google service-account auth (OAuth 2.0 JWT bearer flow) and discovery of the
 * GA4 properties / Search Console sites the account can read, so the settings
 * page can offer them instead of asking for IDs by hand.
 */
import { type AdminEnv, HttpError } from "./env";
import { getSecret, requireKv } from "./settings";

const SCOPES = [
	"https://www.googleapis.com/auth/analytics.readonly",
	"https://www.googleapis.com/auth/webmasters.readonly",
];

function b64url(input: string | Uint8Array): string {
	const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
	let s = "";
	for (const b of bytes) s += String.fromCharCode(b);
	return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToDer(pem: string): ArrayBuffer {
	const body = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
	const bin = atob(body);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out.buffer;
}

export async function signServiceAccountJwt(
	sa: { client_email: string; private_key: string },
	scopes: string[],
	now = Math.floor(Date.now() / 1000),
): Promise<string> {
	const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
	const claims = b64url(
		JSON.stringify({
			aud: "https://oauth2.googleapis.com/token",
			exp: now + 3600,
			iat: now,
			iss: sa.client_email,
			scope: scopes.join(" "),
		}),
	);
	const key = await crypto.subtle.importKey(
		"pkcs8",
		pemToDer(sa.private_key),
		{ hash: "SHA-256", name: "RSASSA-PKCS1-v1_5" },
		false,
		["sign"],
	);
	const sig = new Uint8Array(
		await crypto.subtle.sign(
			"RSASSA-PKCS1-v1_5",
			key,
			new TextEncoder().encode(`${header}.${claims}`),
		),
	);
	return `${header}.${claims}.${b64url(sig)}`;
}

/** access token for the stored service account, cached in KV until shortly before expiry */
export async function googleToken(env: AdminEnv, fetcher: typeof fetch = fetch): Promise<string> {
	const kv = requireKv(env);
	const cached = await kv.get("cms:google:token");
	if (cached) return cached;
	const raw = await getSecret(env, "googleServiceAccount");
	if (!raw) throw new HttpError(412, "google_not_configured", "Chưa nhập Google service account");
	const sa = JSON.parse(raw) as { client_email: string; private_key: string };
	const assertion = await signServiceAccountJwt(sa, SCOPES);
	const res = await fetcher("https://oauth2.googleapis.com/token", {
		body: new URLSearchParams({
			assertion,
			grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
		}),
		method: "POST",
	});
	const body = (await res.json()) as {
		access_token?: string;
		expires_in?: number;
		error_description?: string;
	};
	if (!res.ok || !body.access_token) {
		throw new HttpError(
			502,
			"google_auth_failed",
			`Google từ chối service account: ${body.error_description ?? res.status}`,
		);
	}
	await kv.put("cms:google:token", body.access_token, {
		expirationTtl: Math.max(60, (body.expires_in ?? 3600) - 300),
	});
	return body.access_token;
}

async function gget<T>(token: string, url: string, fetcher: typeof fetch): Promise<T> {
	const res = await fetcher(url, { headers: { Authorization: `Bearer ${token}` } });
	if (!res.ok) {
		const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
		throw new HttpError(
			502,
			"google_api_error",
			`Google ${res.status}: ${body.error?.message ?? res.statusText}`,
		);
	}
	return (await res.json()) as T;
}

export interface GoogleDiscovery {
	serviceAccount: string;
	ga4: { property: string; name: string; account: string }[];
	searchConsole: { siteUrl: string; permission: string }[];
	errors: string[];
}

/** lists what the service account can see, so the user just picks from a list */
export async function discoverGoogle(
	env: AdminEnv,
	fetcher: typeof fetch = fetch,
): Promise<GoogleDiscovery> {
	const raw = await getSecret(env, "googleServiceAccount");
	if (!raw) throw new HttpError(412, "google_not_configured", "Chưa nhập Google service account");
	const { client_email } = JSON.parse(raw) as { client_email: string };
	const token = await googleToken(env, fetcher);
	const out: GoogleDiscovery = {
		errors: [],
		ga4: [],
		searchConsole: [],
		serviceAccount: client_email,
	};

	const [ga, gsc] = await Promise.allSettled([
		gget<{
			accountSummaries?: {
				displayName: string;
				propertySummaries?: { property: string; displayName: string }[];
			}[];
		}>(
			token,
			"https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200",
			fetcher,
		),
		gget<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>(
			token,
			"https://www.googleapis.com/webmasters/v3/sites",
			fetcher,
		),
	]);
	if (ga.status === "fulfilled") {
		for (const acc of ga.value.accountSummaries ?? []) {
			for (const p of acc.propertySummaries ?? []) {
				out.ga4.push({
					account: acc.displayName,
					name: p.displayName,
					property: p.property.replace("properties/", ""),
				});
			}
		}
	} else out.errors.push(`GA4: ${(ga.reason as Error).message}`);
	if (gsc.status === "fulfilled") {
		out.searchConsole = (gsc.value.siteEntry ?? []).map((s) => ({
			permission: s.permissionLevel,
			siteUrl: s.siteUrl,
		}));
	} else out.errors.push(`Search Console: ${(gsc.reason as Error).message}`);
	return out;
}
