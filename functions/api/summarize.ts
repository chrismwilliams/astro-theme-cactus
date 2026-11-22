import type { AdminEnv } from "../admin/env";
import { handleAdmin } from "../admin/router";
import { handleQuiz, handleReactions, type KV } from "./reader";

/** minimal shapes of the Cloudflare bindings used here (avoids a @cloudflare/workers-types dependency) */
interface Ai {
	run(model: string, inputs: Record<string, unknown>): Promise<unknown>;
}
interface Fetcher {
	fetch(request: Request): Promise<Response>;
}

interface Env extends AdminEnv {
	AI: Ai;
	ASSETS: Fetcher;
	/** one KV namespace for reactions, quiz votes and the CMS (key prefixes keep them apart) */
	BLOG_KV?: KV & NonNullable<AdminEnv["BLOG_KV"]>;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// Handle AI summarize API
		if (url.pathname === "/api/summarize" && request.method === "POST") {
			return handleSummarize(request, env);
		}

		if (url.pathname === "/api/reactions") {
			return handleReactions(request, env.BLOG_KV);
		}

		if (url.pathname === "/api/quiz") {
			return handleQuiz(request, env.BLOG_KV);
		}

		if (url.pathname.startsWith("/api/admin/")) {
			return handleAdmin(request, env);
		}

		// Fallback to static assets
		return env.ASSETS.fetch(request);
	},
};

async function handleSummarize(request: Request, env: Env): Promise<Response> {
	const corsHeaders = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};

	if (request.method === "OPTIONS") {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		const { content } = (await request.json()) as { content: string };

		if (!content || typeof content !== "string") {
			return Response.json(
				{ error: "Missing or invalid 'content' field" },
				{ status: 400, headers: corsHeaders },
			);
		}

		// Truncate to ~4000 chars to stay within model limits and save neurons
		const truncated = content.slice(0, 4000);

		const response = await env.AI.run("@cf/facebook/bart-large-cnn", {
			input_text: truncated,
			max_length: 256,
		});

		return Response.json(
			{ summary: (response as { summary: string }).summary },
			{ headers: corsHeaders },
		);
	} catch (err) {
		console.error("AI summarize error:", err);
		return Response.json(
			{ error: "Failed to generate summary. Please try again later." },
			{ status: 500, headers: corsHeaders },
		);
	}
}
