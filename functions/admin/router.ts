import { reviewPost, testAi, weeklyInsights } from "./ai";
import {
	cached,
	clampDays,
	gaReport,
	gscReport,
	inspectUrls,
	pagespeed,
	rankHistory,
	youtube,
} from "./analytics";
import { requireAdmin, requireSameOrigin } from "./auth";
import { type AdminEnv, HttpError, json } from "./env";
import { deleteFile, getFile, listContent, putFile, testGithub, uploadImage } from "./github";
import { discoverGoogle } from "./google";
import { getConfig, SECRET_NAMES, saveConfig, secretStatus, setSecrets } from "./settings";

async function body<T>(request: Request): Promise<T> {
	try {
		return (await request.json()) as T;
	} catch {
		throw new HttpError(400, "invalid_json");
	}
}

export async function handleAdmin(request: Request, env: AdminEnv): Promise<Response> {
	try {
		const { email } = await requireAdmin(request, env);
		requireSameOrigin(request);
		const url = new URL(request.url);
		const route = `${request.method} ${url.pathname.replace(/^\/api\/admin/, "").replace(/\/+$/, "") || "/"}`;

		switch (route) {
			case "GET /me":
				return json({
					email,
					status: {
						access: true,
						kv: Boolean(env.BLOG_KV),
						masterKey: Boolean(env.CMS_MASTER_KEY && env.CMS_MASTER_KEY.length >= 32),
					},
				});

			case "GET /settings":
				return json({
					config: await getConfig(env),
					secretNames: SECRET_NAMES,
					secrets: await secretStatus(env),
				});

			case "PUT /settings": {
				const b = await body<{ config?: unknown; secrets?: unknown }>(request);
				if (b.secrets) await setSecrets(env, b.secrets);
				const config = b.config ? await saveConfig(env, b.config) : await getConfig(env);
				return json({ config, secrets: await secretStatus(env) });
			}

			case "POST /settings/test": {
				const { target } = await body<{ target?: string }>(request);
				if (target === "github") return json({ ok: true, ...(await testGithub(env)) });
				if (target === "ai") return json({ ok: true, ...(await testAi(env)) });
				if (target === "google") return json({ ok: true, ...(await discoverGoogle(env)) });
				throw new HttpError(400, "unknown_target");
			}

			case "GET /google/discover":
				return json(await discoverGoogle(env));

			case "GET /content":
				return json({ files: await listContent(env) });

			case "GET /file":
				return json(await getFile(env, url.searchParams.get("path") ?? ""));

			case "PUT /file": {
				const b = await body<{ path?: string; content?: string; sha?: string; message?: string }>(
					request,
				);
				if (typeof b.path !== "string" || typeof b.content !== "string")
					throw new HttpError(400, "invalid_input");
				return json(
					await putFile(env, {
						content: b.content,
						email,
						message:
							typeof b.message === "string" && b.message.trim()
								? b.message
								: `docs: update ${b.path}`,
						path: b.path,
						sha: typeof b.sha === "string" ? b.sha : undefined,
					}),
				);
			}

			case "DELETE /file": {
				const b = await body<{ path?: string; sha?: string }>(request);
				if (typeof b.path !== "string" || typeof b.sha !== "string")
					throw new HttpError(400, "invalid_input");
				await deleteFile(env, { email, path: b.path, sha: b.sha });
				return json({ ok: true });
			}

			case "POST /upload": {
				const b = await body<{ name?: string; base64?: string }>(request);
				if (typeof b.name !== "string" || typeof b.base64 !== "string")
					throw new HttpError(400, "invalid_input");
				return json(await uploadImage(env, { base64: b.base64, email, name: b.name }));
			}

			case "POST /ai/review": {
				const b = await body<Record<string, unknown>>(request);
				const str = (v: unknown) => (typeof v === "string" ? v : "");
				const sitePosts = Array.isArray(b.sitePosts)
					? (b.sitePosts as { path: string; title: string; tags: string[] }[])
					: [];
				return json(
					await reviewPost(env, {
						body: str(b.body),
						description: str(b.description),
						keyword: str(b.keyword),
						path: str(b.path),
						searchData: str(b.searchData),
						sitePosts: sitePosts.filter(
							(p) => typeof p?.path === "string" && typeof p?.title === "string",
						),
						tags: Array.isArray(b.tags)
							? (b.tags as unknown[]).filter((t): t is string => typeof t === "string")
							: [],
						title: str(b.title),
					}),
				);
			}

			case "GET /analytics/ga":
				return json(
					await gaReport(
						env,
						clampDays(url.searchParams.get("days")),
						url.searchParams.has("fresh"),
					),
				);

			case "GET /analytics/gsc":
				return json(
					await gscReport(
						env,
						clampDays(url.searchParams.get("days")),
						url.searchParams.has("fresh"),
					),
				);

			case "GET /analytics/rank":
				return json(
					await rankHistory(
						env,
						clampDays(url.searchParams.get("days") ?? "90"),
						url.searchParams.has("fresh"),
					),
				);

			case "POST /analytics/inspect": {
				const b = await body<{ urls?: unknown; fresh?: boolean }>(request);
				const urls = Array.isArray(b.urls)
					? b.urls.filter((u): u is string => typeof u === "string")
					: [];
				return json(await inspectUrls(env, urls, b.fresh === true));
			}

			case "GET /analytics/psi": {
				const target = url.searchParams.get("url") ?? "";
				const strategy = url.searchParams.get("strategy") === "desktop" ? "desktop" : "mobile";
				try {
					new URL(target);
				} catch {
					throw new HttpError(400, "invalid_url");
				}
				return json(await pagespeed(env, target, strategy, url.searchParams.has("fresh")));
			}

			case "GET /analytics/youtube":
				return json(await youtube(env, url.searchParams.has("fresh")));

			case "POST /ai/insights": {
				const b = await body<{ posts?: unknown; fresh?: boolean }>(request);
				const posts = (Array.isArray(b.posts) ? b.posts : [])
					.slice(0, 300)
					.filter((p): p is Record<string, unknown> => Boolean(p) && typeof p === "object")
					.map((p) => ({
						issues: Number(p.issues) || 0,
						path: String(p.path ?? "").slice(0, 200),
						score: Number(p.score) || 0,
						title: String(p.title ?? "").slice(0, 200),
						words: Number(p.words) || 0,
					}));
				const [gsc, ga] = await Promise.all([
					gscReport(env, 28).catch(() => null),
					gaReport(env, 28).catch(() => null),
				]);
				const data = JSON.stringify({
					ga: ga && { pages: ga.pages.slice(0, 40), totals: ga.totals },
					gsc: gsc && {
						cannibalization: gsc.cannibalization.slice(0, 10),
						pages: gsc.pages.slice(0, 60),
						queries: gsc.queries.slice(0, 150),
						totals: gsc.totals,
					},
					posts,
				});
				const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
				const hash = [...new Uint8Array(digest)]
					.slice(0, 12)
					.map((x) => x.toString(16).padStart(2, "0"))
					.join("");
				return json(
					await cached(env, `insights:${hash}`, 12 * 3600, b.fresh === true, () =>
						weeklyInsights(env, data),
					),
				);
			}

			default:
				throw new HttpError(404, "not_found");
		}
	} catch (err) {
		if (err instanceof HttpError)
			return json({ error: err.code, message: err.message }, err.status);
		console.error("admin api error", err);
		return json({ error: "internal_error", message: "Lỗi máy chủ" }, 500);
	}
}
