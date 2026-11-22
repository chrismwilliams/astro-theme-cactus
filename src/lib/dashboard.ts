/** Shared types and UI helpers for the CMS analytics pages. */
import { type ApiError, esc } from "./cms-client";

export interface GaTotals {
	users: number;
	views: number;
	sessions: number;
	avgEngagementSec: number;
}
export interface GaData {
	days: number;
	cachedAt: string;
	totals: { current: GaTotals; previous: GaTotals };
	daily: { date: string; users: number; views: number }[];
	pages: {
		path: string;
		views: number;
		users: number;
		avgEngagementSec: number;
		readComplete: number;
	}[];
	channels: { name: string; sessions: number }[];
	devices: { name: string; users: number }[];
	countries: { name: string; users: number }[];
	realtimeUsers: number | null;
}
export interface GscTotals {
	clicks: number;
	impressions: number;
	ctr: number;
	position: number;
}
export interface GscRowQ {
	query: string;
	clicks: number;
	impressions: number;
	ctr: number;
	position: number;
}
export interface GscData {
	days: number;
	cachedAt: string;
	range: { start: string; end: string };
	totals: { current: GscTotals; previous: GscTotals };
	daily: { date: string; clicks: number; impressions: number; position: number }[];
	queries: GscRowQ[];
	pages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
	cannibalization: {
		query: string;
		pages: { page: string; impressions: number; position: number }[];
	}[];
}

/** expected CTR by position (rough industry curve) used to flag under-performing snippets */
export function expectedCtr(position: number): number {
	const curve = [0.28, 0.15, 0.1, 0.07, 0.05, 0.04, 0.03, 0.025, 0.02, 0.018];
	return position <= 10 ? (curve[Math.max(0, Math.round(position) - 1)] ?? 0.02) : 0.01;
}

export function pathOf(urlOrPath: string): string {
	try {
		return new URL(urlOrPath, "https://blog.datnt.work").pathname;
	} catch {
		return urlOrPath;
	}
}

const PERIOD_KEY = "cms:period";
export function getPeriod(): number {
	try {
		const v = Number(localStorage.getItem(PERIOD_KEY));
		return [7, 28, 90].includes(v) ? v : 28;
	} catch {
		return 28;
	}
}

/** date-range presets + refresh, in one row above everything they scope */
export function initFilters(root: HTMLElement, onChange: (days: number, fresh: boolean) => void) {
	const seg = root.querySelector<HTMLElement>("[data-period]");
	const set = (days: number) => {
		seg?.querySelectorAll<HTMLButtonElement>("button").forEach((b) => {
			b.setAttribute("aria-pressed", String(Number(b.dataset.days) === days));
		});
	};
	let days = getPeriod();
	set(days);
	seg?.querySelectorAll<HTMLButtonElement>("button").forEach((b) => {
		b.addEventListener("click", () => {
			days = Number(b.dataset.days);
			try {
				localStorage.setItem(PERIOD_KEY, String(days));
			} catch {}
			set(days);
			onChange(days, false);
		});
	});
	root.querySelector("[data-refresh]")?.addEventListener("click", () => onChange(days, true));
	onChange(days, false);
}

const SETUP_HINT: Record<string, string> = {
	ga4_not_configured: "Chọn GA4 property trong Cài đặt → Google.",
	google_forbidden:
		"Service account chưa được cấp quyền. Thêm email service account vào GA4 (Viewer) và Search Console.",
	google_not_configured: "Dán Google service account JSON trong Cài đặt → Google.",
	gsc_not_configured: "Chọn site Search Console trong Cài đặt → Google.",
	youtube_not_configured: "Nhập YouTube Data API key trong Cài đặt → Google.",
};

/** friendly empty state for a card when a data source is not set up or fails */
export function showError(el: HTMLElement, err: unknown) {
	const e = err as ApiError;
	const hint = SETUP_HINT[e.code ?? ""];
	el.innerHTML = `<div class="cms-empty"><p>${esc(hint ?? e.message ?? "Không tải được dữ liệu")}</p>${
		hint
			? '<a class="mt-2 inline-block underline" href="/admin/settings/#google">Mở Cài đặt</a>'
			: ""
	}</div>`;
}

export function cachedNote(el: Element | null, cachedAt: string) {
	if (!el) return;
	const mins = Math.round((Date.now() - Date.parse(cachedAt)) / 60000);
	el.textContent =
		mins < 1
			? "vừa cập nhật"
			: mins < 60
				? `cập nhật ${mins} phút trước`
				: `cập nhật ${Math.round(mins / 60)} giờ trước`;
}

export const FILTERS_HTML = `<div class="cms-filters">
	<div class="cms-seg" data-period role="group" aria-label="Khoảng thời gian">
		<button data-days="7" type="button">7 ngày</button><button data-days="28" type="button">28 ngày</button><button data-days="90" type="button">90 ngày</button>
	</div>
	<button class="btn btn-ghost h-9 text-xs" data-refresh type="button">↻ Làm mới</button>
	<span class="text-muted font-mono text-[11px]" data-cached></span>
</div>`;

export interface PsiResult {
	url: string;
	strategy: "mobile" | "desktop";
	cachedAt: string;
	scores: { performance: number; seo: number; accessibility: number; bestPractices: number };
	lab: { lcpMs: number; cls: number; tbtMs: number; fcpMs: number };
	field: {
		lcpMs?: number;
		inpMs?: number;
		cls?: number;
		overall?: string;
		source: "url" | "origin" | "none";
	};
}

const scoreLevel = (n: number): "good" | "warn" | "poor" =>
	n >= 90 ? "good" : n >= 50 ? "warn" : "poor";
const vital = (metric: "lcp" | "inp" | "cls", v: number): "good" | "warn" | "poor" => {
	const t = { cls: [0.1, 0.25], inp: [200, 500], lcp: [2500, 4000] }[metric];
	return v <= (t[0] ?? 0) ? "good" : v <= (t[1] ?? 0) ? "warn" : "poor";
};
const ICON = { good: "✓", poor: "✕", warn: "!" };
const badge = (level: "good" | "warn" | "poor", text: string) =>
	`<span class="cms-status ${level}"><span>${ICON[level]}</span> ${esc(text)}</span>`;

/** Lighthouse scores + Core Web Vitals (field data first, lab as fallback), status always with icon + text */
export function psiHtml(r: PsiResult): string {
	const s = r.scores;
	const scores = (
		[
			["Performance", s.performance],
			["SEO", s.seo],
			["Accessibility", s.accessibility],
			["Best practices", s.bestPractices],
		] as const
	)
		.map(
			([label, v]) =>
				`<div><div class="text-muted text-[11px]">${label}</div>${badge(scoreLevel(v), String(v))}</div>`,
		)
		.join("");
	const f = r.field;
	const field =
		f.source === "none"
			? '<p class="cms-help">Chưa đủ dữ liệu người dùng thật (CrUX), hiển thị số đo lab.</p>'
			: `<p class="cms-help">Người dùng thật (CrUX, 28 ngày${f.source === "origin" ? ", cả site" : ""}):</p>`;
	const lcp = f.lcpMs ?? r.lab.lcpMs;
	const cls = f.cls ?? r.lab.cls;
	const vitals = [
		`<div><div class="text-muted text-[11px]">LCP</div>${badge(vital("lcp", lcp), `${(lcp / 1000).toFixed(1)}s`)}</div>`,
		f.inpMs !== undefined
			? `<div><div class="text-muted text-[11px]">INP</div>${badge(vital("inp", f.inpMs), `${Math.round(f.inpMs)}ms`)}</div>`
			: `<div><div class="text-muted text-[11px]">TBT (lab)</div>${badge(r.lab.tbtMs <= 200 ? "good" : r.lab.tbtMs <= 600 ? "warn" : "poor", `${Math.round(r.lab.tbtMs)}ms`)}</div>`,
		`<div><div class="text-muted text-[11px]">CLS</div>${badge(vital("cls", cls), cls.toFixed(2))}</div>`,
	].join("");
	return `<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">${scores}</div>${field}<div class="mt-1 grid grid-cols-3 gap-3">${vitals}</div>`;
}
