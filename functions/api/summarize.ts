import type { AdminEnv } from "../admin/env";
import { handleAdmin } from "../admin/router";
import { handleQuiz, handleReactions, type KV } from "./reader";
import { handleSummary } from "./summary";

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

		// AI TL;DR for a post (cached per post version)
		if (url.pathname === "/api/summary") {
			return handleSummary(request, env);
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
