/**
 * AI SEO review with Claude, routed through Cloudflare AI Gateway
 * (https://gateway.ai.cloudflare.com/v1/<account>/<gateway>/anthropic).
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { type AdminEnv, HttpError } from "./env";
import { getConfig, getSecret } from "./settings";

export const SeoReview = z.object({
	score: z.number().describe("0-100 overall SEO and content quality score"),
	summary: z.string().describe("2-3 sentence verdict in Vietnamese"),
	primaryKeyword: z.string(),
	secondaryKeywords: z.array(z.string()),
	searchIntent: z.string().describe("what a searcher wants when landing on this post"),
	issues: z.array(
		z.object({
			severity: z.enum(["high", "medium", "low"]),
			area: z.enum([
				"title",
				"meta",
				"headings",
				"content",
				"links",
				"images",
				"technical",
				"readability",
			]),
			problem: z.string(),
			fix: z.string(),
		}),
	),
	titleSuggestions: z.array(z.string()).describe("3 titles, max 60 characters each"),
	metaSuggestions: z.array(z.string()).describe("2 meta descriptions, 140-155 characters each"),
	tagSuggestions: z.array(z.string()).describe("lowercase tags, prefer existing site tags"),
	internalLinks: z.array(
		z.object({
			anchorText: z.string().describe("exact phrase from the post to turn into a link"),
			targetPath: z.string().describe("one of the provided site post paths"),
			reason: z.string(),
		}),
	),
	faq: z.array(z.object({ question: z.string(), answer: z.string() })).describe("2-4 FAQ entries"),
	tldr: z.string().describe("3-bullet TL;DR in markdown"),
});
export type SeoReview = z.infer<typeof SeoReview>;

const SYSTEM = `Bạn là chuyên gia SEO và biên tập viên cho một blog kỹ thuật tiếng Việt về Application Security, DevSecOps và web security (blog.datnt.work, tác giả là Security Engineer).

Nhiệm vụ: đánh giá một bài viết (markdown + frontmatter) và đưa ra gợi ý cụ thể, có thể làm ngay.
- Viết mọi nhận xét bằng tiếng Việt, giữ nguyên thuật ngữ kỹ thuật tiếng Anh khi người Việt thường tìm bằng tiếng Anh (ví dụ "JWT", "SSRF").
- Chấm điểm dựa trên: độ khớp search intent, tiêu đề/meta, cấu trúc heading, độ sâu và chính xác kỹ thuật, ví dụ/code, link nội bộ, khả năng đọc trên mobile.
- Gợi ý link nội bộ chỉ được dùng các đường dẫn có trong danh sách bài của site.
- Không bịa số liệu traffic hay thứ hạng; nếu có dữ liệu Search Console thì dựa vào đó.`;

export interface ReviewInput {
	path: string;
	title: string;
	description: string;
	tags: string[];
	keyword?: string;
	body: string;
	sitePosts: { path: string; title: string; tags: string[] }[];
	searchData?: string;
}

export async function claudeClient(env: AdminEnv) {
	const [config, apiKey, gatewayToken] = await Promise.all([
		getConfig(env),
		getSecret(env, "anthropicApiKey"),
		getSecret(env, "aiGatewayToken"),
	]);
	const { accountId, gatewayId } = config.ai;
	const viaGateway = Boolean(accountId && gatewayId);
	if (!apiKey && !viaGateway) {
		throw new HttpError(412, "ai_not_configured", "Chưa nhập Anthropic API key hoặc AI Gateway");
	}
	const anthropic = new Anthropic({
		// with keys stored in AI Gateway (BYOK) the gateway supplies the real key
		apiKey: apiKey ?? "stored-in-ai-gateway",
		...(viaGateway
			? { baseURL: `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/anthropic` }
			: {}),
		...(gatewayToken
			? { defaultHeaders: { "cf-aig-authorization": `Bearer ${gatewayToken}` } }
			: {}),
		maxRetries: 1,
		timeout: 120_000,
	});
	return { anthropic, config, viaGateway };
}

export async function reviewPost(
	env: AdminEnv,
	input: ReviewInput,
): Promise<{ review: SeoReview; model: string; viaGateway: boolean }> {
	if (input.body.length > 120_000)
		throw new HttpError(413, "too_large", "Bài quá dài để phân tích một lần");
	const { anthropic, config, viaGateway } = await claudeClient(env);
	const sitePosts = input.sitePosts
		.slice(0, 200)
		.map((p) => `- ${p.path} | ${p.title} | ${p.tags.join(", ")}`)
		.join("\n");
	const userContent = `<site_posts>\n${sitePosts}\n</site_posts>

${input.searchData ? `<search_console>\n${input.searchData}\n</search_console>\n\n` : ""}<post path="${input.path}">
title: ${input.title}
description: ${input.description}
tags: ${input.tags.join(", ")}
focus keyword: ${input.keyword || "(chưa đặt)"}

${input.body}
</post>`;

	try {
		const response = await anthropic.beta.messages.parse({
			betas: ["server-side-fallback-2026-07-01"],
			fallbacks: "default",
			max_tokens: 16000,
			messages: [{ content: userContent, role: "user" }],
			model: config.ai.model || "claude-opus-5-5",
			output_config: { effort: config.ai.effort, format: betaZodOutputFormat(SeoReview) },
			system: SYSTEM,
		});
		if (response.stop_reason === "refusal") {
			throw new HttpError(422, "ai_refused", "Claude từ chối phân tích bài này");
		}
		if (!response.parsed_output)
			throw new HttpError(502, "ai_bad_output", "AI trả về dữ liệu không đúng định dạng");
		return { model: response.model, review: response.parsed_output, viaGateway };
	} catch (err) {
		if (err instanceof HttpError) throw err;
		if (
			err instanceof Anthropic.AuthenticationError ||
			err instanceof Anthropic.PermissionDeniedError
		) {
			throw new HttpError(502, "ai_auth_failed", "Anthropic/AI Gateway từ chối khoá");
		}
		if (err instanceof Anthropic.RateLimitError)
			throw new HttpError(429, "ai_rate_limited", "AI đang bị giới hạn, thử lại sau");
		if (err instanceof Anthropic.APIError) {
			throw new HttpError(
				502,
				"ai_error",
				`AI lỗi ${err.status ?? ""}: ${err.message}`.slice(0, 300),
			);
		}
		throw err;
	}
}

/** cheap round trip to check the key / gateway settings */
export async function testAi(env: AdminEnv) {
	const { anthropic, config, viaGateway } = await claudeClient(env);
	try {
		const res = await anthropic.messages.create({
			max_tokens: 64,
			messages: [{ content: "Reply with: ok", role: "user" }],
			model: config.ai.model || "claude-opus-5-5",
			output_config: { effort: "low" },
		});
		return { model: res.model, viaGateway };
	} catch (err) {
		if (err instanceof Anthropic.APIError) {
			throw new HttpError(
				502,
				"ai_error",
				`AI lỗi ${err.status ?? ""}: ${err.message}`.slice(0, 300),
			);
		}
		throw err;
	}
}
