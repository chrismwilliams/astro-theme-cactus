/**
 * CMS settings: plain config in KV, credentials sealed with AES-GCM.
 * Secrets are write-only through the API: reads return only whether a value
 * is set plus a short hint, never the value itself.
 */
import { deriveKey, open, type Sealed, seal } from "./crypto";
import { type AdminEnv, HttpError, type KVStore } from "./env";

export const SECRET_NAMES = [
	"githubToken",
	"anthropicApiKey",
	"aiGatewayToken",
	"googleServiceAccount",
	"pagespeedApiKey",
	"youtubeApiKey",
] as const;
export type SecretName = (typeof SECRET_NAMES)[number];

export interface CmsConfig {
	site: { url: string };
	github: { owner: string; repo: string; branch: string };
	ai: { accountId: string; gatewayId: string; model: string; effort: "low" | "medium" | "high" };
	google: { ga4PropertyId: string; gscSiteUrl: string; youtubeChannel: string };
}

export const DEFAULT_CONFIG: CmsConfig = {
	ai: { accountId: "", effort: "medium", gatewayId: "", model: "claude-opus-5-5" },
	github: { branch: "main", owner: "datntpro", repo: "blog" },
	google: {
		ga4PropertyId: "",
		gscSiteUrl: "sc-domain:blog.datnt.work",
		youtubeChannel: "@datntwork",
	},
	site: { url: "https://blog.datnt.work" },
};

interface StoredSecret extends Sealed {
	hint: string;
	updatedAt: string;
}

export interface SecretStatus {
	set: boolean;
	hint?: string;
	updatedAt?: string;
}

const CONFIG_KEY = "cms:config";
const secretKey = (name: SecretName) => `cms:secret:${name}`;

export function requireKv(env: AdminEnv): KVStore {
	if (!env.BLOG_KV) throw new HttpError(503, "kv_missing", "Chưa có KV binding BLOG_KV.");
	return env.BLOG_KV;
}

const isStr = (v: unknown, max = 300): v is string => typeof v === "string" && v.length <= max;

/** merges a partial update into the current config, ignoring unknown keys */
export function mergeConfig(current: CmsConfig, patch: unknown): CmsConfig {
	const next: CmsConfig = structuredClone(current);
	if (!patch || typeof patch !== "object") return next;
	const p = patch as Record<string, Record<string, unknown> | undefined>;
	for (const section of Object.keys(next) as (keyof CmsConfig)[]) {
		const src = p[section];
		if (!src || typeof src !== "object") continue;
		const dst = next[section] as unknown as Record<string, unknown>;
		for (const field of Object.keys(dst)) {
			const v = src[field];
			if (v === undefined) continue;
			if (!isStr(v)) throw new HttpError(400, "invalid_config", `${section}.${field} không hợp lệ`);
			dst[field] = v.trim();
		}
	}
	if (!["low", "medium", "high"].includes(next.ai.effort)) next.ai.effort = "medium";
	if (next.site.url && !/^https:\/\/[^/\s]+/.test(next.site.url)) {
		throw new HttpError(400, "invalid_config", "site.url phải bắt đầu bằng https://");
	}
	for (const [k, v] of Object.entries({ owner: next.github.owner, repo: next.github.repo })) {
		if (v && !/^[\w.-]+$/.test(v))
			throw new HttpError(400, "invalid_config", `github.${k} không hợp lệ`);
	}
	if (next.github.branch && !/^[\w./-]+$/.test(next.github.branch)) {
		throw new HttpError(400, "invalid_config", "github.branch không hợp lệ");
	}
	for (const [k, v] of Object.entries({
		accountId: next.ai.accountId,
		gatewayId: next.ai.gatewayId,
	})) {
		if (v && !/^[\w-]+$/.test(v))
			throw new HttpError(400, "invalid_config", `ai.${k} không hợp lệ`);
	}
	return next;
}

export async function getConfig(env: AdminEnv): Promise<CmsConfig> {
	const raw = await requireKv(env).get(CONFIG_KEY);
	if (!raw) return structuredClone(DEFAULT_CONFIG);
	try {
		return mergeConfig(DEFAULT_CONFIG, JSON.parse(raw));
	} catch {
		return structuredClone(DEFAULT_CONFIG);
	}
}

export async function saveConfig(env: AdminEnv, patch: unknown): Promise<CmsConfig> {
	const next = mergeConfig(await getConfig(env), patch);
	await requireKv(env).put(CONFIG_KEY, JSON.stringify(next));
	return next;
}

/** validates a credential before storing it and builds the hint shown in the UI */
export function validateSecret(name: SecretName, value: string): string {
	if (value.length > 20_000) throw new HttpError(400, "invalid_secret", "Giá trị quá dài");
	if (name === "googleServiceAccount") {
		let sa: { type?: string; client_email?: string; private_key?: string };
		try {
			sa = JSON.parse(value);
		} catch {
			throw new HttpError(
				400,
				"invalid_secret",
				"Service account phải là file JSON tải từ Google Cloud",
			);
		}
		if (
			sa.type !== "service_account" ||
			!sa.client_email ||
			!sa.private_key?.includes("PRIVATE KEY")
		) {
			throw new HttpError(400, "invalid_secret", "JSON thiếu client_email hoặc private_key");
		}
		return sa.client_email;
	}
	if (/\s/.test(value))
		throw new HttpError(400, "invalid_secret", "Khoá không được chứa khoảng trắng");
	if (value.length < 8) throw new HttpError(400, "invalid_secret", "Khoá quá ngắn");
	return `…${value.slice(-4)}`;
}

export async function setSecrets(env: AdminEnv, updates: unknown): Promise<void> {
	if (!updates || typeof updates !== "object") return;
	const kv = requireKv(env);
	const key = await deriveKey(env.CMS_MASTER_KEY);
	for (const [name, raw] of Object.entries(updates as Record<string, unknown>)) {
		if (!(SECRET_NAMES as readonly string[]).includes(name)) continue;
		const n = name as SecretName;
		if (raw === null) {
			await kv.delete(secretKey(n));
			continue;
		}
		if (typeof raw !== "string" || raw.trim() === "") continue; // empty = keep current value
		const value = raw.trim();
		const hint = validateSecret(n, value);
		const stored: StoredSecret = {
			...(await seal(key, n, value)),
			hint,
			updatedAt: new Date().toISOString(),
		};
		await kv.put(secretKey(n), JSON.stringify(stored));
	}
}

export async function getSecret(env: AdminEnv, name: SecretName): Promise<string | null> {
	const raw = await requireKv(env).get(secretKey(name));
	if (!raw) return null;
	const stored = JSON.parse(raw) as StoredSecret;
	return open(await deriveKey(env.CMS_MASTER_KEY), name, stored);
}

export async function secretStatus(env: AdminEnv): Promise<Record<SecretName, SecretStatus>> {
	const kv = requireKv(env);
	const out = {} as Record<SecretName, SecretStatus>;
	await Promise.all(
		SECRET_NAMES.map(async (n) => {
			const raw = await kv.get(secretKey(n));
			if (!raw) {
				out[n] = { set: false };
				return;
			}
			const s = JSON.parse(raw) as StoredSecret;
			out[n] = { hint: s.hint, set: true, updatedAt: s.updatedAt };
		}),
	);
	return out;
}
