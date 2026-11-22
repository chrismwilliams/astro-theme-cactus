/**
 * Phase 2 data sources for the CMS dashboard. Every call is cached in KV so the
 * dashboard stays fast and well inside Google's quotas; `fresh` bypasses it.
 *
 * - GA4 Data API (batchRunReports + realtime)
 * - Search Console (searchAnalytics.query, urlInspection)
 * - PageSpeed Insights v5 (Lighthouse + CrUX field data)
 * - YouTube Data API v3
 */
import { type AdminEnv, HttpError } from "./env";
import { googleToken } from "./google";
import { type CmsConfig, getConfig, getSecret, requireKv } from "./settings";

type Fetch = typeof fetch;

/* ---------------- helpers ---------------- */

export async function cached<T>(
	env: AdminEnv,
	key: string,
	ttlSeconds: number,
	fresh: boolean,
	produce: () => Promise<T>,
): Promise<T & { cachedAt: string }> {
	const kv = requireKv(env);
	const full = `cms:cache:${key}`;
	if (!fresh) {
		const hit = await kv.get(full);
		if (hit) return JSON.parse(hit) as T & { cachedAt: string };
	}
	const value = { ...(await produce()), cachedAt: new Date().toISOString() };
	await kv.put(full, JSON.stringify(value), { expirationTtl: Math.max(60, ttlSeconds) });
	return value;
}

async function gfetch<T>(
	token: string,
	url: string,
	body: unknown | undefined,
	fetcher: Fetch,
): Promise<T> {
	const res = await fetcher(url, {
		...(body === undefined ? {} : { body: JSON.stringify(body), method: "POST" }),
		headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
	});
	if (!res.ok) {
		const err = (await res.json().catch(() => ({}))) as {
			error?: { message?: string; status?: string };
		};
		const msg = err.error?.message ?? res.statusText;
		const code = res.status === 403 ? "google_forbidden" : "google_api_error";
		throw new HttpError(
			res.status === 403 ? 403 : 502,
			code,
			`Google ${res.status}: ${msg}`.slice(0, 300),
		);
	}
	return (await res.json()) as T;
}

const DAY = 86_400_000;
const ymd = (d: Date) => d.toISOString().slice(0, 10);
export function clampDays(v: string | null): number {
	const n = Number(v ?? 28);
	return [7, 28, 90, 365].includes(n) ? n : 28;
}

async function googleConfig(env: AdminEnv): Promise<CmsConfig["google"]> {
	return (await getConfig(env)).google;
}

/* ---------------- GA4 ---------------- */

interface GaRow {
	dimensionValues?: { value: string }[];
	metricValues?: { value: string }[];
}
interface GaReport {
	rows?: GaRow[];
}

const num = (r: GaRow, i: number) => Number(r.metricValues?.[i]?.value ?? 0);
const dim = (r: GaRow, i: number) => r.dimensionValues?.[i]?.value ?? "";

export interface GaData {
	days: number;
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
interface GaTotals {
	users: number;
	views: number;
	sessions: number;
	avgEngagementSec: number;
}

export async function gaReport(env: AdminEnv, days: number, fresh = false, fetcher: Fetch = fetch) {
	const { ga4PropertyId } = await googleConfig(env);
	if (!/^\d{5,15}$/.test(ga4PropertyId)) {
		throw new HttpError(412, "ga4_not_configured", "Chưa chọn GA4 property trong Cài đặt");
	}
	return cached<GaData>(env, `ga:${ga4PropertyId}:${days}`, 3600, fresh, async () => {
		const token = await googleToken(env, fetcher);
		const base = `https://analyticsdata.googleapis.com/v1beta/properties/${ga4PropertyId}`;
		const range = { endDate: "yesterday", startDate: `${days}daysAgo` };
		const prev = { endDate: `${days + 1}daysAgo`, startDate: `${days * 2}daysAgo` };
		const totalsMetrics = [
			"activeUsers",
			"screenPageViews",
			"sessions",
			"userEngagementDuration",
		].map((name) => ({
			name,
		}));
		const [a, b] = await Promise.all([
			gfetch<{ reports: GaReport[] }>(
				token,
				`${base}:batchRunReports`,
				{
					requests: [
						{ dateRanges: [range, prev], metrics: totalsMetrics },
						{
							dateRanges: [range],
							dimensions: [{ name: "date" }],
							metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
							orderBys: [{ dimension: { dimensionName: "date" } }],
						},
						{
							dateRanges: [range],
							dimensions: [{ name: "pagePath" }],
							limit: 100,
							metrics: [
								{ name: "screenPageViews" },
								{ name: "activeUsers" },
								{ name: "userEngagementDuration" },
							],
							orderBys: [{ desc: true, metric: { metricName: "screenPageViews" } }],
						},
						{
							dateRanges: [range],
							dimensions: [{ name: "sessionDefaultChannelGroup" }],
							metrics: [{ name: "sessions" }],
							orderBys: [{ desc: true, metric: { metricName: "sessions" } }],
						},
						{
							dateRanges: [range],
							dimensions: [{ name: "deviceCategory" }],
							metrics: [{ name: "activeUsers" }],
						},
					],
				},
				fetcher,
			),
			gfetch<{ reports: GaReport[] }>(
				token,
				`${base}:batchRunReports`,
				{
					requests: [
						{
							dateRanges: [range],
							dimensions: [{ name: "country" }],
							limit: 8,
							metrics: [{ name: "activeUsers" }],
							orderBys: [{ desc: true, metric: { metricName: "activeUsers" } }],
						},
						{
							dateRanges: [range],
							dimensionFilter: {
								filter: { fieldName: "eventName", stringFilter: { value: "read_complete" } },
							},
							dimensions: [{ name: "pagePath" }],
							limit: 100,
							metrics: [{ name: "eventCount" }],
						},
					],
				},
				fetcher,
			),
		]);
		const realtime = await gfetch<GaReport>(
			token,
			`${base}:runRealtimeReport`,
			{ metrics: [{ name: "activeUsers" }] },
			fetcher,
		).catch(() => null);

		const [totalsR, dailyR, pagesR, channelsR, devicesR] = a.reports;
		const [countriesR, readR] = b.reports;
		const totalsFor = (idx: number): GaTotals => {
			// with two date ranges GA adds a "dateRange" dimension: date_range_0 / date_range_1
			const row =
				totalsR?.rows?.find((r) => dim(r, 0) === `date_range_${idx}`) ?? totalsR?.rows?.[idx];
			if (!row) return { avgEngagementSec: 0, sessions: 0, users: 0, views: 0 };
			const users = num(row, 0);
			return {
				avgEngagementSec: users ? num(row, 3) / users : 0,
				sessions: num(row, 2),
				users,
				views: num(row, 1),
			};
		};
		const reads = new Map((readR?.rows ?? []).map((r) => [dim(r, 0), num(r, 0)]));
		return {
			channels: (channelsR?.rows ?? []).map((r) => ({ name: dim(r, 0), sessions: num(r, 0) })),
			countries: (countriesR?.rows ?? []).map((r) => ({ name: dim(r, 0), users: num(r, 0) })),
			daily: (dailyR?.rows ?? []).map((r) => {
				const d = dim(r, 0);
				return {
					date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
					users: num(r, 0),
					views: num(r, 1),
				};
			}),
			days,
			devices: (devicesR?.rows ?? []).map((r) => ({ name: dim(r, 0), users: num(r, 0) })),
			pages: (pagesR?.rows ?? []).map((r) => {
				const users = num(r, 1);
				return {
					avgEngagementSec: users ? num(r, 2) / users : 0,
					path: dim(r, 0),
					readComplete: reads.get(dim(r, 0)) ?? 0,
					users,
					views: num(r, 0),
				};
			}),
			realtimeUsers: realtime?.rows?.[0] ? num(realtime.rows[0], 0) : realtime ? 0 : null,
			totals: { current: totalsFor(0), previous: totalsFor(1) },
		};
	});
}

/* ---------------- Search Console ---------------- */

interface GscRow {
	keys?: string[];
	clicks: number;
	impressions: number;
	ctr: number;
	position: number;
}

export interface GscData {
	days: number;
	range: { start: string; end: string };
	totals: { current: GscTotals; previous: GscTotals };
	daily: { date: string; clicks: number; impressions: number; position: number }[];
	queries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
	pages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
	cannibalization: {
		query: string;
		pages: { page: string; impressions: number; position: number }[];
	}[];
}
interface GscTotals {
	clicks: number;
	impressions: number;
	ctr: number;
	position: number;
}

function gscTotals(rows: GscRow[]): GscTotals {
	const clicks = rows.reduce((s, r) => s + r.clicks, 0);
	const impressions = rows.reduce((s, r) => s + r.impressions, 0);
	// impression-weighted average position, as Search Console computes it
	const position = impressions
		? rows.reduce((s, r) => s + r.position * r.impressions, 0) / impressions
		: 0;
	return { clicks, ctr: impressions ? clicks / impressions : 0, impressions, position };
}

/** Search Console data lags ~2-3 days; ranges end 3 days ago */
export function gscRange(days: number, now = Date.now()) {
	const end = new Date(now - 3 * DAY);
	const start = new Date(end.getTime() - (days - 1) * DAY);
	const prevEnd = new Date(start.getTime() - DAY);
	const prevStart = new Date(prevEnd.getTime() - (days - 1) * DAY);
	return { end: ymd(end), prevEnd: ymd(prevEnd), prevStart: ymd(prevStart), start: ymd(start) };
}

async function gscSite(env: AdminEnv) {
	const { gscSiteUrl } = await googleConfig(env);
	if (!gscSiteUrl)
		throw new HttpError(412, "gsc_not_configured", "Chưa chọn site Search Console trong Cài đặt");
	return gscSiteUrl;
}

async function gscQuery(
	token: string,
	site: string,
	body: Record<string, unknown>,
	fetcher: Fetch,
) {
	const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
	return (
		(await gfetch<{ rows?: GscRow[] }>(token, url, { dataState: "final", ...body }, fetcher))
			.rows ?? []
	);
}

export async function gscReport(
	env: AdminEnv,
	days: number,
	fresh = false,
	fetcher: Fetch = fetch,
) {
	const site = await gscSite(env);
	return cached<GscData>(env, `gsc:${site}:${days}`, 3 * 3600, fresh, async () => {
		const token = await googleToken(env, fetcher);
		const r = gscRange(days);
		const [daily, prevDaily, queries, pages, queryPage] = await Promise.all([
			gscQuery(token, site, { dimensions: ["date"], endDate: r.end, startDate: r.start }, fetcher),
			gscQuery(
				token,
				site,
				{ dimensions: ["date"], endDate: r.prevEnd, startDate: r.prevStart },
				fetcher,
			),
			gscQuery(
				token,
				site,
				{ dimensions: ["query"], endDate: r.end, rowLimit: 1000, startDate: r.start },
				fetcher,
			),
			gscQuery(
				token,
				site,
				{ dimensions: ["page"], endDate: r.end, rowLimit: 500, startDate: r.start },
				fetcher,
			),
			gscQuery(
				token,
				site,
				{ dimensions: ["query", "page"], endDate: r.end, rowLimit: 5000, startDate: r.start },
				fetcher,
			),
		]);
		// two or more of our pages earning impressions for the same query
		const byQuery = new Map<string, { page: string; impressions: number; position: number }[]>();
		for (const row of queryPage) {
			const [q = "", page = ""] = row.keys ?? [];
			if (row.impressions < 10) continue;
			const list = byQuery.get(q) ?? [];
			list.push({ impressions: row.impressions, page, position: row.position });
			byQuery.set(q, list);
		}
		const cannibalization = [...byQuery.entries()]
			.filter(([, list]) => list.length > 1)
			.map(([query, list]) => ({
				pages: list.sort((x, y) => y.impressions - x.impressions),
				query,
			}))
			.sort(
				(x, y) =>
					y.pages.reduce((s, p) => s + p.impressions, 0) -
					x.pages.reduce((s, p) => s + p.impressions, 0),
			)
			.slice(0, 20);
		const pick = (row: GscRow) => ({
			clicks: row.clicks,
			ctr: row.ctr,
			impressions: row.impressions,
			position: row.position,
		});
		return {
			cannibalization,
			daily: daily.map((row) => ({
				clicks: row.clicks,
				date: row.keys?.[0] ?? "",
				impressions: row.impressions,
				position: row.position,
			})),
			days,
			pages: pages.map((row) => ({ page: row.keys?.[0] ?? "", ...pick(row) })),
			queries: queries.map((row) => ({ query: row.keys?.[0] ?? "", ...pick(row) })),
			range: { end: r.end, start: r.start },
			totals: { current: gscTotals(daily), previous: gscTotals(prevDaily) },
		};
	});
}

/** daily average position for the top queries, for the rank tracker */
export async function rankHistory(
	env: AdminEnv,
	days: number,
	fresh = false,
	fetcher: Fetch = fetch,
) {
	const site = await gscSite(env);
	return cached<{
		series: { query: string; impressions: number; points: { date: string; position: number }[] }[];
	}>(env, `rank:${site}:${days}`, 6 * 3600, fresh, async () => {
		const token = await googleToken(env, fetcher);
		const r = gscRange(days);
		const rows = await gscQuery(
			token,
			site,
			{ dimensions: ["query", "date"], endDate: r.end, rowLimit: 25000, startDate: r.start },
			fetcher,
		);
		const byQuery = new Map<
			string,
			{ impressions: number; points: { date: string; position: number }[] }
		>();
		for (const row of rows) {
			const [q = "", date = ""] = row.keys ?? [];
			const entry = byQuery.get(q) ?? { impressions: 0, points: [] };
			entry.impressions += row.impressions;
			entry.points.push({ date, position: row.position });
			byQuery.set(q, entry);
		}
		const series = [...byQuery.entries()]
			.map(([query, v]) => ({
				query,
				...v,
				points: v.points.sort((x, y) => x.date.localeCompare(y.date)),
			}))
			.sort((x, y) => y.impressions - x.impressions)
			.slice(0, 30);
		return { series };
	});
}

export interface Inspection {
	url: string;
	verdict: string;
	coverageState: string;
	lastCrawlTime?: string;
	googleCanonical?: string;
	error?: string;
}

/** URL Inspection API (2,000 calls/day per site); each result is cached for a day */
export async function inspectUrls(
	env: AdminEnv,
	urls: string[],
	fresh = false,
	fetcher: Fetch = fetch,
) {
	const site = await gscSite(env);
	const { site: siteCfg } = await getConfig(env);
	const origin = new URL(siteCfg.url).origin;
	const list = urls.filter((u) => {
		try {
			return new URL(u).origin === origin;
		} catch {
			return false;
		}
	});
	if (list.length > 40) throw new HttpError(400, "too_many", "Tối đa 40 URL mỗi lần");
	const token = await googleToken(env, fetcher);
	const results: Inspection[] = [];
	for (const url of list) {
		results.push(
			await cached<Inspection>(env, `inspect:${url}`, 24 * 3600, fresh, async () => {
				try {
					const res = await gfetch<{
						inspectionResult?: {
							indexStatusResult?: {
								verdict?: string;
								coverageState?: string;
								lastCrawlTime?: string;
								googleCanonical?: string;
							};
						};
					}>(
						token,
						"https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
						{ inspectionUrl: url, siteUrl: site },
						fetcher,
					);
					const s = res.inspectionResult?.indexStatusResult ?? {};
					return {
						coverageState: s.coverageState ?? "",
						url,
						verdict: s.verdict ?? "VERDICT_UNSPECIFIED",
						...(s.lastCrawlTime ? { lastCrawlTime: s.lastCrawlTime } : {}),
						...(s.googleCanonical ? { googleCanonical: s.googleCanonical } : {}),
					};
				} catch (e) {
					return { coverageState: "", error: (e as Error).message, url, verdict: "ERROR" };
				}
			}),
		);
	}
	return { results };
}

/* ---------------- PageSpeed Insights ---------------- */

interface PsiMetric {
	percentile?: number;
	category?: string;
}
export interface PsiResult {
	url: string;
	strategy: "mobile" | "desktop";
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

export async function pagespeed(
	env: AdminEnv,
	url: string,
	strategy: "mobile" | "desktop",
	fresh = false,
	fetcher: Fetch = fetch,
) {
	const { site } = await getConfig(env);
	if (new URL(url).origin !== new URL(site.url).origin)
		throw new HttpError(400, "invalid_url", "Chỉ kiểm tra URL của blog");
	return cached<PsiResult>(env, `psi:${strategy}:${url}`, 24 * 3600, fresh, async () => {
		const key = await getSecret(env, "pagespeedApiKey");
		const qs = new URLSearchParams({ strategy, url });
		for (const c of ["performance", "seo", "accessibility", "best-practices"])
			qs.append("category", c);
		if (key) qs.set("key", key);
		const res = await fetcher(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${qs}`);
		const body = (await res.json()) as {
			error?: { message?: string };
			lighthouseResult?: {
				categories?: Record<string, { score?: number }>;
				audits?: Record<string, { numericValue?: number }>;
			};
			loadingExperience?: {
				overall_category?: string;
				metrics?: Record<string, PsiMetric>;
				origin_fallback?: boolean;
			};
			originLoadingExperience?: { overall_category?: string; metrics?: Record<string, PsiMetric> };
		};
		if (!res.ok || !body.lighthouseResult) {
			throw new HttpError(
				502,
				"psi_error",
				`PageSpeed: ${body.error?.message ?? res.status}`.slice(0, 300),
			);
		}
		const cat = body.lighthouseResult.categories ?? {};
		const audit = (k: string) => body.lighthouseResult?.audits?.[k]?.numericValue ?? 0;
		const score = (k: string) => Math.round((cat[k]?.score ?? 0) * 100);
		const le =
			body.loadingExperience?.metrics && !body.loadingExperience.origin_fallback
				? body.loadingExperience
				: body.originLoadingExperience;
		const m = le?.metrics ?? {};
		const source: PsiResult["field"]["source"] = !le?.metrics
			? "none"
			: le === body.loadingExperience
				? "url"
				: "origin";
		return {
			field: {
				source,
				...(m.LARGEST_CONTENTFUL_PAINT_MS?.percentile !== undefined
					? { lcpMs: m.LARGEST_CONTENTFUL_PAINT_MS.percentile }
					: {}),
				...(m.INTERACTION_TO_NEXT_PAINT?.percentile !== undefined
					? { inpMs: m.INTERACTION_TO_NEXT_PAINT.percentile }
					: {}),
				...(m.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile !== undefined
					? { cls: m.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100 }
					: {}),
				...(le?.overall_category ? { overall: le.overall_category } : {}),
			},
			lab: {
				cls: audit("cumulative-layout-shift"),
				fcpMs: audit("first-contentful-paint"),
				lcpMs: audit("largest-contentful-paint"),
				tbtMs: audit("total-blocking-time"),
			},
			scores: {
				accessibility: score("accessibility"),
				bestPractices: score("best-practices"),
				performance: score("performance"),
				seo: score("seo"),
			},
			strategy,
			url,
		};
	});
}

/* ---------------- YouTube ---------------- */

export interface YoutubeData {
	channel: {
		id: string;
		title: string;
		thumbnail: string;
		subscribers: number | null;
		views: number;
		videos: number;
	};
	videos: {
		id: string;
		title: string;
		publishedAt: string;
		thumbnail: string;
		views: number;
		likes: number;
		comments: number;
	}[];
}

export async function youtube(env: AdminEnv, fresh = false, fetcher: Fetch = fetch) {
	const key = await getSecret(env, "youtubeApiKey");
	if (!key)
		throw new HttpError(
			412,
			"youtube_not_configured",
			"Chưa nhập YouTube Data API key trong Cài đặt",
		);
	const { youtubeChannel } = await googleConfig(env);
	const handle = youtubeChannel.startsWith("@") ? youtubeChannel : `@${youtubeChannel}`;
	return cached<YoutubeData>(env, `yt:${handle}`, 6 * 3600, fresh, async () => {
		const get = async <T>(path: string, params: Record<string, string>) => {
			const res = await fetcher(
				`https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams({ ...params, key })}`,
			);
			const body = (await res.json()) as T & { error?: { message?: string } };
			if (!res.ok)
				throw new HttpError(502, "youtube_error", `YouTube: ${body.error?.message ?? res.status}`);
			return body;
		};
		const ch = await get<{
			items?: {
				id: string;
				snippet: { title: string; thumbnails?: { default?: { url: string } } };
				statistics: {
					subscriberCount?: string;
					hiddenSubscriberCount?: boolean;
					viewCount?: string;
					videoCount?: string;
				};
				contentDetails: { relatedPlaylists: { uploads: string } };
			}[];
		}>("channels", { forHandle: handle, part: "snippet,statistics,contentDetails" });
		const c = ch.items?.[0];
		if (!c) throw new HttpError(404, "youtube_channel_not_found", `Không tìm thấy kênh ${handle}`);
		const uploads = await get<{ items?: { contentDetails: { videoId: string } }[] }>(
			"playlistItems",
			{
				maxResults: "12",
				part: "contentDetails",
				playlistId: c.contentDetails.relatedPlaylists.uploads,
			},
		);
		const ids = (uploads.items ?? []).map((i) => i.contentDetails.videoId);
		const vids = ids.length
			? await get<{
					items?: {
						id: string;
						snippet: {
							title: string;
							publishedAt: string;
							thumbnails?: { medium?: { url: string } };
						};
						statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
					}[];
				}>("videos", { id: ids.join(","), part: "snippet,statistics" })
			: { items: [] };
		return {
			channel: {
				id: c.id,
				subscribers: c.statistics.hiddenSubscriberCount
					? null
					: Number(c.statistics.subscriberCount ?? 0),
				thumbnail: c.snippet.thumbnails?.default?.url ?? "",
				title: c.snippet.title,
				videos: Number(c.statistics.videoCount ?? 0),
				views: Number(c.statistics.viewCount ?? 0),
			},
			videos: (vids.items ?? []).map((v) => ({
				comments: Number(v.statistics.commentCount ?? 0),
				id: v.id,
				likes: Number(v.statistics.likeCount ?? 0),
				publishedAt: v.snippet.publishedAt,
				thumbnail: v.snippet.thumbnails?.medium?.url ?? "",
				title: v.snippet.title,
				views: Number(v.statistics.viewCount ?? 0),
			})),
		};
	});
}
