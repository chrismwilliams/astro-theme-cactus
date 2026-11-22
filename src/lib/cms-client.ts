/** Browser-side helpers for the CMS pages. */
import { analyze, type Frontmatter, parseDoc, slugFromPath } from "./seo";

export class ApiError extends Error {
	constructor(
		public status: number,
		public code: string,
		message: string,
	) {
		super(message);
	}
}

export async function api<T>(
	path: string,
	init: { method?: string; body?: unknown } = {},
): Promise<T> {
	const res = await fetch(`/api/admin${path}`, {
		body: init.body === undefined ? null : JSON.stringify(init.body),
		credentials: "same-origin",
		headers: { "Content-Type": "application/json", "X-CMS-Request": "1" },
		method: init.method ?? "GET",
	});
	const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
	if (!res.ok) {
		const err = new ApiError(
			res.status,
			data.error ?? "error",
			data.message ?? `Lỗi ${res.status}`,
		);
		if (res.status === 401 || res.status === 503) showAuthBanner(err);
		throw err;
	}
	return data as T;
}

export function esc(s: unknown): string {
	return String(s ?? "").replace(
		/[&<>"']/g,
		(c) => ({ '"': "&quot;", "&": "&amp;", "'": "&#39;", "<": "&lt;", ">": "&gt;" })[c] ?? c,
	);
}

export function toast(message: string, kind: "ok" | "error" = "ok") {
	let region = document.getElementById("cms-toast");
	if (!region) {
		region = document.createElement("div");
		region.id = "cms-toast";
		region.setAttribute("role", "status");
		document.body.append(region);
	}
	const el = document.createElement("div");
	el.className = `cms-toast-item ${kind}`;
	el.textContent = message;
	region.append(el);
	setTimeout(() => el.remove(), kind === "error" ? 6000 : 2800);
}

function showAuthBanner(err: ApiError) {
	if (document.getElementById("cms-auth-banner")) return;
	const el = document.createElement("div");
	el.id = "cms-auth-banner";
	el.className = "cms-banner error";
	el.innerHTML =
		err.code === "access_not_configured"
			? "<b>CMS đang khoá.</b> Cloudflare Access chưa được cấu hình (biến ACCESS_TEAM_DOMAIN / ACCESS_AUD). Xem hướng dẫn trong README của PR."
			: err.status === 401
				? `<b>Phiên đăng nhập hết hạn.</b> <a href="${esc(location.pathname)}">Tải lại trang</a> để đăng nhập lại qua Cloudflare Access.`
				: `<b>${esc(err.message)}</b>`;
	document.querySelector(".cms-main")?.prepend(el);
}

export interface ContentFile {
	path: string;
	sha: string;
	content: string;
}

export interface PostRow {
	path: string;
	sha: string;
	slug: string;
	kind: "post" | "note";
	data: Frontmatter;
	title: string;
	date: string;
	draft: boolean;
	score: number;
	words: number;
	issues: number;
}

export function toRows(files: ContentFile[]): PostRow[] {
	return files.map((f) => {
		const doc = parseDoc(f.content);
		const slug = slugFromPath(f.path);
		const result = analyze({ body: doc.body, data: doc.data, keyword: doc.data.keyword, slug });
		return {
			data: doc.data,
			date: String(doc.data.publishDate ?? ""),
			draft: Boolean(doc.data.draft),
			issues: result.checks.filter((c) => c.level !== "ok").length,
			kind: f.path.startsWith("content/notes/") ? "note" : "post",
			path: f.path,
			score: result.score,
			sha: f.sha,
			slug,
			title: String(doc.data.title ?? slug),
			words: result.stats.words,
		};
	});
}

/** sortable timestamp from the mixed date formats used in frontmatter */
export function ts(value: unknown): number {
	const t = new Date(String(value ?? "")).getTime();
	return Number.isNaN(t) ? 0 : t;
}

export function fmtDate(value: string): string {
	const d = new Date(value);
	return Number.isNaN(d.getTime())
		? value
		: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function scoreBadge(score: number): string {
	const cls = score >= 80 ? "good" : score >= 60 ? "mid" : "bad";
	return `<span class="cms-score ${cls}" title="Điểm SEO">${score}</span>`;
}

export function siteUrlFor(row: { kind: string; slug: string }): string {
	return `/${row.kind === "note" ? "notes" : "posts"}/${row.slug}/`;
}
