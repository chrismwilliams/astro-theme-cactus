/**
 * Public "TL;DR by AI" for blog posts.
 *
 * The browser only sends the post path; the Worker reads the post from the
 * site's own assets, so this endpoint cannot be used as a free LLM proxy.
 * Summaries are cached in KV per (path, content hash): each version of a post
 * is summarised once, every later click is served from the cache.
 */
import Anthropic from "@anthropic-ai/sdk";
import { claudeClient } from "../admin/ai";
import type { AdminEnv, KVStore } from "../admin/env";
import { getConfig } from "../admin/settings";

interface Ai {
	run(model: string, inputs: Record<string, unknown>): Promise<unknown>;
}
interface Fetcher {
	fetch(request: Request): Promise<Response>;
}
export interface SummaryEnv extends AdminEnv {
	AI: Ai;
	ASSETS: Fetcher;
}

const PATH_RE = /^\/(posts|notes)\/[a-z0-9][a-z0-9/_-]{0,150}\/$/;
const MAX_CHARS = 40_000;
/** multilingual fallback when Claude is not configured in the CMS */
const WORKERS_AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const PROMPT = `Tóm tắt bài blog kỹ thuật dưới đây cho người đọc tiếng Việt.
- Viết 3 đến 5 gạch đầu dòng, mỗi dòng tối đa 30 từ, bắt đầu bằng "- ".
- Giữ nguyên thuật ngữ kỹ thuật tiếng Anh (JWT, SSRF, CI...).
- Chỉ dùng thông tin có trong bài, không thêm lời mở đầu hay kết luận.`;

const json = (data: unknown, status = 200, cacheSeconds = 0) =>
	Response.json(data, {
		headers: { "Cache-Control": cacheSeconds ? `public, max-age=${cacheSeconds}` : "no-store" },
		status,
	});

/** visible article text from the built post page */
export function extractPostText(html: string): string {
	const start = html.indexOf("data-post-body");
	if (start < 0) return "";
	const from = html.indexOf(">", start) + 1;
	const endMarker = html.indexOf('class="post-after"', from);
	const chunk = html.slice(from, endMarker > 0 ? endMarker : undefined);
	return chunk
		.replace(/<(script|style|svg|button|figure[^>]*class="[^"]*not-prose)[\s\S]*?<\/\1>/gi, " ")
		.replace(/<pre[\s\S]*?<\/pre>/gi, " [code] ")
		.replace(/<\/(p|h[1-6]|li|div|tr|blockquote)>/gi, "\n")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/[ \t]+/g, " ")
		.replace(/\n\s*\n+/g, "\n")
		.trim()
		.slice(0, MAX_CHARS);
}

async function sha256(text: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
	return [...new Uint8Array(digest)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, 24);
}

async function withClaude(
	env: SummaryEnv,
	text: string,
): Promise<{ summary: string; model: string }> {
	const { anthropic, config } = await claudeClient(env);
	const res = await anthropic.beta.messages.create({
		betas: ["server-side-fallback-2026-07-01"],
		fallbacks: "default",
		max_tokens: 2000,
		messages: [{ content: `${PROMPT}\n\n<post>\n${text}\n</post>`, role: "user" }],
		model: config.ai.model || "claude-opus-5-5",
		output_config: { effort: "low" },
	});
	if (res.stop_reason === "refusal") throw new Error("refused");
	const summary = res.content
		.map((b) => (b.type === "text" ? b.text : ""))
		.join("")
		.trim();
	if (!summary) throw new Error("empty summary");
	return { model: res.model, summary };
}

async function withWorkersAi(
	env: SummaryEnv,
	text: string,
): Promise<{ summary: string; model: string }> {
	const out = (await env.AI.run(WORKERS_AI_MODEL, {
		max_tokens: 600,
		messages: [
			{ content: PROMPT, role: "system" },
			{ content: text.slice(0, 12_000), role: "user" },
		],
	})) as { response?: string };
	const summary = (out.response ?? "").trim();
	if (!summary) throw new Error("empty summary");
	return { model: WORKERS_AI_MODEL, summary };
}

export async function handleSummary(request: Request, env: SummaryEnv): Promise<Response> {
	if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
	const origin = request.headers.get("Origin");
	if (origin && origin !== new URL(request.url).origin) return json({ error: "forbidden" }, 403);

	let path = "";
	try {
		path = String(((await request.json()) as { path?: unknown }).path ?? "");
	} catch {
		return json({ error: "invalid_json" }, 400);
	}
	if (!PATH_RE.test(path) || path.includes("..")) return json({ error: "invalid_path" }, 400);

	const page = await env.ASSETS.fetch(new Request(new URL(path, request.url)));
	if (!page.ok) return json({ error: "not_found" }, 404);
	const text = extractPostText(await page.text());
	if (text.length < 200)
		return json({ error: "too_short", message: "Bài quá ngắn để tóm tắt." }, 422);

	const kv: KVStore | undefined = env.BLOG_KV;
	const key = `sum:v1:${path}:${await sha256(text)}`;
	const cached = kv ? await kv.get(key) : null;
	if (cached) return json({ ...(JSON.parse(cached) as object), cached: true }, 200, 300);

	let result: { summary: string; model: string } | null = null;
	const errors: string[] = [];
	const config = kv ? await getConfig(env).catch(() => null) : null;
	if (config) {
		try {
			result = await withClaude(env, text);
		} catch (err) {
			errors.push(
				err instanceof Anthropic.APIError
					? `claude ${err.status}`
					: `claude: ${(err as Error).message}`,
			);
		}
	}
	if (!result) {
		try {
			result = await withWorkersAi(env, text);
		} catch (err) {
			errors.push(`workers-ai: ${(err as Error).message}`);
		}
	}
	if (!result) {
		console.error("summary failed", path, errors);
		return json(
			{ error: "ai_unavailable", message: "AI tạm thời không phản hồi, thử lại sau." },
			503,
		);
	}
	if (kv) await kv.put(key, JSON.stringify(result));
	return json({ ...result, cached: false });
}
