/**
 * Deterministic on-page SEO checks for a markdown post. Runs in the browser
 * (editor, post list) so the score updates while typing, without AI calls.
 */
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export interface Frontmatter {
	title?: string | undefined;
	description?: string | undefined;
	publishDate?: string | undefined;
	updatedDate?: string | undefined;
	tags?: string[] | undefined;
	draft?: boolean | undefined;
	pinned?: boolean | undefined;
	coverImage?: { src: string; alt: string } | undefined;
	/** CMS only: focus keyword, ignored by the site build */
	keyword?: string | undefined;
	[key: string]: unknown;
}

export interface ParsedDoc {
	data: Frontmatter;
	body: string;
}

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseDoc(raw: string): ParsedDoc {
	const m = raw.match(FM_RE);
	if (!m) return { body: raw, data: {} };
	let data: Frontmatter = {};
	try {
		const parsed = parseYaml(m[1] ?? "");
		if (parsed && typeof parsed === "object") data = parsed as Frontmatter;
	} catch {
		/* keep empty frontmatter on invalid yaml */
	}
	return { body: raw.slice(m[0].length), data };
}

export function serializeDoc(doc: ParsedDoc): string {
	const data = Object.fromEntries(
		Object.entries(doc.data).filter(
			([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0),
		),
	);
	return `---\n${stringifyYaml(data, { lineWidth: 0 }).trimEnd()}\n---\n\n${doc.body.replace(/^\n+/, "")}`;
}

export type Level = "ok" | "warn" | "error";
export interface Check {
	id: string;
	level: Level;
	label: string;
	weight: number;
}
export interface SeoResult {
	score: number;
	checks: Check[];
	stats: {
		words: number;
		readingMinutes: number;
		headings: { depth: number; text: string }[];
		internalLinks: number;
		externalLinks: number;
		images: number;
		imagesWithoutAlt: number;
		keywordCount: number;
		keywordDensity: number;
		avgSentenceWords: number;
	};
}

const strip = (s: string) =>
	s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

/** markdown with code blocks, html and link urls removed, for counting words */
function proseOf(body: string): string {
	return body
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`/g, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/^\s*(import|export) .*$/gm, " ")
		.replace(/^:::.*$/gm, " ")
		.replace(/[#>*_~|-]/g, " ");
}

export function analyze(input: {
	data: Frontmatter;
	body: string;
	slug: string;
	keyword?: string | undefined;
}): SeoResult {
	const { data, body, slug } = input;
	const title = String(data.title ?? "");
	const desc = String(data.description ?? "");
	const kw = strip((input.keyword ?? data.keyword ?? "").trim());
	const prose = proseOf(body);
	const words = prose.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
	const headings = [...body.replace(/```[\s\S]*?```/g, "").matchAll(/^(#{1,6})\s+(.+)$/gm)].map(
		(m) => ({
			depth: (m[1] ?? "").length,
			text: (m[2] ?? "").trim(),
		}),
	);
	const links = [...body.matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)].map((m) => m[1] ?? "");
	const internalLinks = links.filter(
		(l) => l.startsWith("/") || l.includes("blog.datnt.work"),
	).length;
	const externalLinks = links.filter(
		(l) => /^https?:\/\//.test(l) && !l.includes("blog.datnt.work"),
	).length;
	const imgs = [...body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
	const imagesWithoutAlt = imgs.filter((m) => !(m[1] ?? "").trim()).length;
	const sentences = prose.split(/[.!?]+\s/).filter((s) => s.trim().split(/\s+/).length > 2);
	const avgSentenceWords = sentences.length ? Math.round(words / sentences.length) : 0;
	const normProse = strip(prose);
	const keywordCount = kw ? normProse.split(kw).length - 1 : 0;
	const keywordDensity = kw && words ? (keywordCount * kw.split(/\s+/).length * 100) / words : 0;
	const firstPara = strip(prose.trim().split(/\n\s*\n/)[0] ?? "");

	const checks: Check[] = [];
	const add = (id: string, level: Level, label: string, weight: number) =>
		checks.push({ id, label, level, weight });

	// title
	if (!title) add("title", "error", "Thiếu tiêu đề", 12);
	else if (title.length < 30)
		add("title", "warn", `Tiêu đề ngắn (${title.length}/60), nên 40–60 ký tự`, 12);
	else if (title.length > 60)
		add("title", "warn", `Tiêu đề dài ${title.length} ký tự, Google sẽ cắt sau ~60`, 12);
	else add("title", "ok", `Tiêu đề ${title.length}/60 ký tự`, 12);

	// description
	if (!desc) add("meta", "error", "Thiếu meta description", 12);
	else if (desc.length < 120) add("meta", "warn", `Meta description ngắn (${desc.length}/155)`, 12);
	else if (desc.length > 160)
		add("meta", "warn", `Meta description dài ${desc.length}/155, sẽ bị cắt`, 12);
	else add("meta", "ok", `Meta description ${desc.length}/155 ký tự`, 12);

	// keyword
	if (!kw) add("kw", "warn", "Chưa đặt từ khoá chính", 14);
	else {
		const where = [
			strip(title).includes(kw) && "tiêu đề",
			strip(desc).includes(kw) && "meta",
			strip(slug.replace(/[-/]/g, " ")).includes(kw) && "slug",
			headings.some((h) => h.depth === 2 && strip(h.text).includes(kw)) && "H2",
			firstPara.includes(kw) && "đoạn đầu",
		].filter(Boolean) as string[];
		const missing = ["tiêu đề", "meta", "slug", "H2", "đoạn đầu"].filter((w) => !where.includes(w));
		if (where.length >= 4) add("kw", "ok", `Từ khoá có trong ${where.join(", ")}`, 14);
		else
			add(
				"kw",
				where.length >= 2 ? "warn" : "error",
				`Từ khoá chưa có trong: ${missing.join(", ")}`,
				14,
			);
		if (keywordDensity > 3)
			add(
				"density",
				"warn",
				`Mật độ từ khoá ${keywordDensity.toFixed(1)}%: có thể bị coi là nhồi từ khoá`,
				4,
			);
		else if (keywordCount > 0)
			add(
				"density",
				"ok",
				`Từ khoá xuất hiện ${keywordCount} lần (${keywordDensity.toFixed(1)}%)`,
				4,
			);
	}

	// length
	if (words < 300) add("words", "error", `Nội dung mỏng: ${words} từ`, 12);
	else if (words < 800)
		add("words", "warn", `${words} từ: bài kỹ thuật chuyên sâu thường 1.000+ từ`, 12);
	else add("words", "ok", `${words.toLocaleString("vi-VN")} từ`, 12);

	// headings
	const h1 = headings.filter((h) => h.depth === 1).length;
	const h2 = headings.filter((h) => h.depth === 2).length;
	let jump = false;
	for (let i = 1; i < headings.length; i++) {
		if ((headings[i]?.depth ?? 0) > (headings[i - 1]?.depth ?? 0) + 1) jump = true;
	}
	if (h1 > 0) add("h1", "warn", "Bài có H1 trong nội dung: tiêu đề đã là H1", 5);
	if (h2 < 2 && words > 400) add("headings", "warn", "Nên chia bài bằng ít nhất 2 heading H2", 8);
	else if (jump) add("headings", "warn", "Nhảy cấp heading (ví dụ H2 → H4)", 8);
	else add("headings", "ok", `${headings.length} heading, cấu trúc hợp lệ`, 8);

	// links
	if (internalLinks === 0) add("internal", "warn", "Chưa có link nội bộ tới bài khác", 8);
	else add("internal", "ok", `${internalLinks} link nội bộ`, 8);
	if (externalLinks > 0) add("external", "ok", `${externalLinks} link tham khảo bên ngoài`, 3);
	else if (words > 600) add("external", "warn", "Chưa có link nguồn tham khảo", 3);

	// images
	if (imagesWithoutAlt > 0) add("alt", "error", `${imagesWithoutAlt} ảnh thiếu alt`, 6);
	else if (imgs.length) add("alt", "ok", `${imgs.length} ảnh đều có alt`, 6);
	if (data.coverImage && !data.coverImage.alt) add("cover", "warn", "Ảnh bìa thiếu alt", 2);

	// slug & readability
	if (/[^a-z0-9/-]/.test(slug))
		add("slug", "warn", "Slug nên chỉ gồm chữ thường không dấu, số và gạch ngang", 3);
	else if ((slug.split("/").pop() ?? "").length > 60) add("slug", "warn", "Slug quá dài", 3);
	else add("slug", "ok", "Slug gọn, không dấu", 3);
	if (avgSentenceWords > 30)
		add("read", "warn", `Câu trung bình ${avgSentenceWords} từ: hơi dài khi đọc trên mobile`, 4);
	else if (words > 0) add("read", "ok", `Câu trung bình ${avgSentenceWords} từ`, 4);
	if (!data.tags?.length) add("tags", "warn", "Chưa có tag", 3);

	const total = checks.reduce((s, c) => s + c.weight, 0) || 1;
	const got = checks.reduce(
		(s, c) => s + (c.level === "ok" ? c.weight : c.level === "warn" ? c.weight * 0.5 : 0),
		0,
	);
	const order: Record<Level, number> = { error: 0, ok: 2, warn: 1 };
	checks.sort((a, b) => order[a.level] - order[b.level]);
	return {
		checks,
		score: Math.round((got / total) * 100),
		stats: {
			avgSentenceWords,
			externalLinks,
			headings,
			images: imgs.length,
			imagesWithoutAlt,
			internalLinks,
			keywordCount,
			keywordDensity,
			readingMinutes: Math.max(1, Math.round(words / 220)),
			words,
		},
	};
}

/** "content/posts/foo/index.md" -> "foo", "content/posts/bar.md" -> "bar" */
export function slugFromPath(path: string): string {
	return path
		.replace(/^content\/(posts|notes)\//, "")
		.replace(/\/index\.mdx?$/, "")
		.replace(/\.mdx?$/, "");
}

export function scoreClass(score: number): "good" | "mid" | "bad" {
	return score >= 80 ? "good" : score >= 60 ? "mid" : "bad";
}
