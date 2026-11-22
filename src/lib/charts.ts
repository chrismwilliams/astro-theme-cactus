/**
 * Small dependency-free SVG/HTML charts for the CMS dashboard.
 *
 * Rules (see the dataviz guidance):
 * - one axis per chart, never dual axis; different measures get separate charts
 * - categorical colours in fixed slot order (--series-1..5, validated light + dark)
 * - thin 2px lines, recessive grid, legend for >= 2 series plus direct end labels
 * - crosshair tooltip listing every series, keyboard accessible (arrow keys)
 * - every chart has a table view; all labels are inserted as text, never HTML
 */

export interface Point {
	x: string; // ISO date
	y: number | null;
}
export interface Series {
	name: string;
	points: Point[];
}

const SVG = "http://www.w3.org/2000/svg";
const svgEl = <K extends keyof SVGElementTagNameMap>(
	tag: K,
	attrs: Record<string, string | number> = {},
) => {
	const el = document.createElementNS(SVG, tag);
	for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
	return el;
};
const h = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = "", text?: string) => {
	const el = document.createElement(tag);
	if (cls) el.className = cls;
	if (text !== undefined) el.textContent = text;
	return el;
};

export const seriesColor = (i: number) => `var(--series-${(i % 5) + 1})`;

export const fmt = {
	date: (iso: string) => {
		const d = new Date(`${iso}T00:00:00`);
		return Number.isNaN(d.getTime())
			? iso
			: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
	},
	duration: (sec: number) => {
		const s = Math.round(sec);
		return s >= 60 ? `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}s` : `${s}s`;
	},
	int: (n: number) => Math.round(n).toLocaleString("vi-VN"),
	compact: (n: number) =>
		n >= 1_000_000
			? `${(n / 1_000_000).toFixed(1)}M`
			: n >= 10_000
				? `${(n / 1000).toFixed(1)}k`
				: Math.round(n).toLocaleString("vi-VN"),
	pct: (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`,
	pos: (n: number) => n.toFixed(1),
};

function niceTicks(min: number, max: number, count = 4): number[] {
	if (min === max) return [min];
	const span = max - min;
	const step0 = span / count;
	const mag = 10 ** Math.floor(Math.log10(step0));
	const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) ?? mag * 10;
	const ticks: number[] = [];
	for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step)
		ticks.push(Number(v.toFixed(6)));
	return ticks;
}

export interface LineChartOptions {
	label: string;
	yFormat?: (n: number) => string;
	/** rank charts: 1 at the top */
	invert?: boolean;
	height?: number;
	/** optional x positions to mark (e.g. publish dates) */
	markers?: { x: string; label: string }[];
}

/** Line chart with crosshair tooltip and table view. Re-renders on resize. */
export function lineChart(container: HTMLElement, series: Series[], opts: LineChartOptions) {
	const yFormat = opts.yFormat ?? fmt.int;
	const height = opts.height ?? 180;
	container.replaceChildren();
	container.classList.add("chart");

	const xs = [...new Set(series.flatMap((s) => s.points.map((p) => p.x)))].sort();
	if (!xs.length) {
		container.append(h("p", "cms-empty", "Chưa có dữ liệu cho khoảng thời gian này."));
		return;
	}

	if (series.length > 1) {
		const legend = h("ul", "chart-legend");
		series.forEach((s, i) => {
			const li = h("li");
			const key = h("span", "chart-key");
			key.style.background = seriesColor(i);
			li.append(key, document.createTextNode(s.name));
			legend.append(li);
		});
		container.append(legend);
	}

	const wrap = h("div", "chart-plot");
	const tip = h("div", "chart-tip");
	tip.hidden = true;
	wrap.append(tip);
	container.append(wrap);

	const values = series.flatMap((s) =>
		s.points.map((p) => p.y).filter((v): v is number => v !== null),
	);
	let yMin = Math.min(...values);
	let yMax = Math.max(...values);
	if (!opts.invert) yMin = Math.min(0, yMin);
	if (opts.invert) yMin = Math.max(1, Math.floor(yMin));
	if (yMin === yMax) yMax = yMin + 1;
	const ticks = niceTicks(yMin, yMax);
	yMin = Math.min(yMin, ticks[0] ?? yMin);
	yMax = Math.max(yMax, ticks.at(-1) ?? yMax);

	const byX = series.map((s) => new Map(s.points.map((p) => [p.x, p.y])));
	let active = -1;

	const render = () => {
		wrap.querySelector("svg")?.remove();
		const width = Math.max(240, wrap.clientWidth);
		const padL = 44;
		const padR = series.length > 1 && series.length <= 4 ? 84 : 12;
		const padT = 10;
		const padB = 24;
		const iw = width - padL - padR;
		const ih = height - padT - padB;
		const xAt = (i: number) => padL + (xs.length === 1 ? iw / 2 : (i / (xs.length - 1)) * iw);
		const yAt = (v: number) => {
			const t = (v - yMin) / (yMax - yMin);
			return padT + (opts.invert ? t : 1 - t) * ih;
		};

		const svg = svgEl("svg", { height, role: "img", viewBox: `0 0 ${width} ${height}`, width });
		svg.setAttribute("aria-label", `${opts.label}. Dùng phím mũi tên để xem từng ngày.`);
		svg.setAttribute("tabindex", "0");

		// grid + y labels
		for (const t of ticks) {
			const y = yAt(t);
			svg.append(svgEl("line", { class: "chart-grid", x1: padL, x2: padL + iw, y1: y, y2: y }));
			const label = svgEl("text", {
				class: "chart-axis",
				"text-anchor": "end",
				x: padL - 8,
				y: y + 4,
			});
			label.textContent = yFormat(t);
			svg.append(label);
		}
		// x labels: first, middle, last
		const xi = [...new Set([0, Math.floor((xs.length - 1) / 2), xs.length - 1])];
		for (const i of xi) {
			const label = svgEl("text", {
				class: "chart-axis",
				"text-anchor": i === 0 ? "start" : i === xs.length - 1 ? "end" : "middle",
				x: xAt(i),
				y: height - 6,
			});
			label.textContent = fmt.date(xs[i] ?? "");
			svg.append(label);
		}
		// markers (publish dates) as small ticks under the axis
		for (const m of opts.markers ?? []) {
			const i = xs.indexOf(m.x);
			if (i < 0) continue;
			const mark = svgEl("path", {
				class: "chart-marker",
				d: `M${xAt(i)} ${padT + ih + 2} l4 6 h-8 z`,
			});
			const title = svgEl("title");
			title.textContent = m.label;
			mark.append(title);
			svg.append(mark);
		}
		// lines
		series.forEach((s, si) => {
			let d = "";
			let pen = false;
			xs.forEach((x, i) => {
				const v = byX[si]?.get(x);
				if (v === null || v === undefined) {
					pen = false;
					return;
				}
				d += `${pen ? "L" : "M"}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`;
				pen = true;
			});
			svg.append(svgEl("path", { class: "chart-line", d, stroke: seriesColor(si) }));
			// direct end label for <= 4 series
			if (series.length > 1 && series.length <= 4) {
				const lastI = xs
					.map((x, i) => (byX[si]?.get(x) != null ? i : -1))
					.filter((i) => i >= 0)
					.at(-1);
				if (lastI !== undefined) {
					const t = svgEl("text", {
						class: "chart-end",
						x: xAt(lastI) + 6,
						y: yAt(byX[si]?.get(xs[lastI] ?? "") ?? 0) + 4,
					});
					t.textContent = s.name.length > 12 ? `${s.name.slice(0, 11)}…` : s.name;
					svg.append(t);
				}
			}
		});

		// crosshair layer
		const cross = svgEl("line", { class: "chart-cross", y1: padT, y2: padT + ih });
		cross.style.display = "none";
		svg.append(cross);
		const dots = series.map((_, si) => {
			const c = svgEl("circle", { class: "chart-dot", fill: seriesColor(si), r: 4.5 });
			c.style.display = "none";
			svg.append(c);
			return c;
		});
		const hit = svgEl("rect", {
			fill: "transparent",
			height: ih + padB,
			width: iw + 16,
			x: padL - 8,
			y: padT,
		});
		svg.append(hit);

		const show = (i: number) => {
			active = Math.max(0, Math.min(xs.length - 1, i));
			const x = xAt(active);
			cross.setAttribute("x1", String(x));
			cross.setAttribute("x2", String(x));
			cross.style.display = "";
			tip.replaceChildren(h("div", "chart-tip-date", fmt.date(xs[active] ?? "")));
			series.forEach((s, si) => {
				const v = byX[si]?.get(xs[active] ?? "");
				const dot = dots[si];
				if (dot) {
					if (v === null || v === undefined) dot.style.display = "none";
					else {
						dot.style.display = "";
						dot.setAttribute("cx", String(x));
						dot.setAttribute("cy", String(yAt(v)));
					}
				}
				const row = h("div", "chart-tip-row");
				const key = h("span", "chart-tip-key");
				key.style.background = seriesColor(si);
				row.append(
					key,
					h("b", "", v === null || v === undefined ? "–" : yFormat(v)),
					h("span", "", s.name),
				);
				tip.append(row);
			});
			tip.hidden = false;
			const left = x + 12 + tip.offsetWidth > width ? x - tip.offsetWidth - 12 : x + 12;
			tip.style.transform = `translate(${left}px, ${padT}px)`;
		};
		const hide = () => {
			cross.style.display = "none";
			for (const d of dots) d.style.display = "none";
			tip.hidden = true;
		};
		hit.addEventListener("pointermove", (e) => {
			const r = svg.getBoundingClientRect();
			const px = ((e.clientX - r.left) / r.width) * width;
			const i = xs.length === 1 ? 0 : Math.round(((px - padL) / iw) * (xs.length - 1));
			show(i);
		});
		hit.addEventListener("pointerleave", hide);
		svg.addEventListener("blur", hide);
		svg.addEventListener("keydown", (e) => {
			if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
				e.preventDefault();
				show((active < 0 ? xs.length - 1 : active) + (e.key === "ArrowRight" ? 1 : -1));
			} else if (e.key === "Escape") hide();
		});
		svg.addEventListener("focus", () => show(active < 0 ? xs.length - 1 : active));
		wrap.prepend(svg);
	};

	render();
	let last = wrap.clientWidth;
	new ResizeObserver(() => {
		if (Math.abs(wrap.clientWidth - last) > 4) {
			last = wrap.clientWidth;
			render();
		}
	}).observe(wrap);

	container.append(
		tableView(
			["Ngày", ...series.map((s) => s.name)],
			xs.map((x, i) => [
				fmt.date(x),
				...series.map((_, si) => {
					const v = byX[si]?.get(xs[i] ?? "");
					return v === null || v === undefined ? "–" : yFormat(v);
				}),
			]),
		),
	);
}

/** collapsible accessible table, built with textContent only */
export function tableView(head: string[], rows: string[][], summary = "Xem dạng bảng") {
	const details = h("details", "chart-table");
	details.append(h("summary", "", summary));
	const table = h("table", "cms-table");
	const tr = h("tr");
	for (const c of head) tr.append(h("th", "", c));
	table.append(h("thead"));
	table.tHead?.append(tr);
	const body = h("tbody");
	for (const r of rows) {
		const row = h("tr");
		r.forEach((c, i) => {
			row.append(h("td", i ? "num" : "", c));
		});
		body.append(row);
	}
	table.append(body);
	details.append(table);
	return details;
}

/** horizontal bars for ranked categories; one hue (magnitude), value labels always visible */
export function barList(
	container: HTMLElement,
	rows: { label: string; value: number; display?: string }[],
	opts: { label: string; max?: number },
) {
	container.replaceChildren();
	if (!rows.length) {
		container.append(h("p", "cms-empty", "Chưa có dữ liệu."));
		return;
	}
	const max = opts.max ?? Math.max(...rows.map((r) => r.value), 1);
	const list = h("ul", "bar-list");
	list.setAttribute("aria-label", opts.label);
	for (const r of rows) {
		const li = h("li");
		const head = h("div", "bar-head");
		head.append(
			h("span", "bar-label", r.label),
			h("span", "bar-value", r.display ?? fmt.int(r.value)),
		);
		const track = h("div", "bar-track");
		const fill = h("div", "bar-fill");
		fill.style.width = `${Math.max(1.5, (r.value / max) * 100)}%`;
		track.append(fill);
		li.title = `${r.label}: ${r.display ?? fmt.int(r.value)}`;
		li.append(head, track);
		list.append(li);
	}
	container.append(list);
}

/** one 100% stacked bar with 2px gaps, legend with values (identity never colour-only) */
export function stackedBar(
	container: HTMLElement,
	parts: { label: string; value: number }[],
	opts: { label: string },
) {
	container.replaceChildren();
	const total = parts.reduce((s, p) => s + p.value, 0);
	if (!total) {
		container.append(h("p", "cms-empty", "Chưa có dữ liệu."));
		return;
	}
	const bar = h("div", "stack-bar");
	bar.setAttribute("role", "img");
	bar.setAttribute(
		"aria-label",
		`${opts.label}: ${parts.map((p) => `${p.label} ${fmt.pct(p.value / total, 0)}`).join(", ")}`,
	);
	const legend = h("ul", "chart-legend stack-legend");
	parts.forEach((p, i) => {
		const seg = h("div", "stack-seg");
		seg.style.flexGrow = String(p.value);
		seg.style.background = seriesColor(i);
		seg.title = `${p.label}: ${fmt.int(p.value)} (${fmt.pct(p.value / total, 0)})`;
		bar.append(seg);
		const li = h("li");
		const key = h("span", "chart-key chart-key-box");
		key.style.background = seriesColor(i);
		li.append(key, document.createTextNode(`${p.label} `), h("b", "", fmt.pct(p.value / total, 0)));
		legend.append(li);
	});
	container.append(bar, legend);
}

/** Core Web Vitals thresholds (good / needs improvement / poor) */
export function vitalStatus(metric: "lcp" | "inp" | "cls", v: number): "good" | "warn" | "poor" {
	const t = { cls: [0.1, 0.25], inp: [200, 500], lcp: [2500, 4000] }[metric];
	return v <= (t[0] ?? 0) ? "good" : v <= (t[1] ?? 0) ? "warn" : "poor";
}

export function statusBadge(level: "good" | "warn" | "poor", text: string) {
	const icon = { good: "✓", poor: "✕", warn: "!" }[level];
	const label = { good: "Tốt", poor: "Kém", warn: "Cần cải thiện" }[level];
	const el = h("span", `cms-status ${level}`);
	el.append(h("span", "", icon), document.createTextNode(` ${text}`));
	el.title = label;
	return el;
}

export function delta(
	current: number,
	previous: number,
	opts: { invert?: boolean; format?: (n: number) => string } = {},
) {
	const el = h("span", "cms-delta");
	if (!previous) {
		el.textContent = "–";
		return el;
	}
	const diff = current - previous;
	const better = opts.invert ? diff < 0 : diff > 0;
	const text = opts.format ? opts.format(Math.abs(diff)) : fmt.pct(Math.abs(diff) / previous);
	el.textContent = `${diff === 0 ? "=" : better ? "▲" : "▼"} ${text}`;
	el.classList.add(diff === 0 ? "flat" : better ? "up" : "down");
	el.title = "so với kỳ trước";
	return el;
}

/** vertical columns for counts over ordered categories (e.g. posts per month); one hue */
export function columnChart(
	container: HTMLElement,
	cols: { label: string; value: number }[],
	opts: { label: string },
) {
	container.replaceChildren();
	const max = Math.max(1, ...cols.map((c) => c.value));
	const plot = h("div", "col-chart");
	plot.setAttribute("role", "img");
	plot.setAttribute(
		"aria-label",
		`${opts.label}: ${cols.map((c) => `${c.label} ${c.value}`).join(", ")}`,
	);
	for (const c of cols) {
		const col = h("div", "col");
		col.title = `${c.label}: ${c.value}`;
		col.tabIndex = 0;
		const bar = h("div", "col-bar");
		bar.style.height = `${(c.value / max) * 100}%`;
		const val = h("span", "col-val", c.value ? String(c.value) : "");
		const lab = h("span", "col-label", c.label);
		col.append(val, bar, lab);
		plot.append(col);
	}
	container.append(
		plot,
		tableView(
			["Tháng", "Số bài"],
			cols.map((c) => [c.label, String(c.value)]),
		),
	);
}
