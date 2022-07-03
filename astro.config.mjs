import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { toString } from "hast-util-to-string";
import { h } from "hastscript";
import { astroImageTools } from "astro-imagetools";
import robotsTxt from "astro-robots-txt";

const AnchorLinkIcon = h(
	`svg`,
	{
		xmlns: "http://www.w3.org/2000/svg",
		width: 20,
		height: 20,
		viewBox: "0 0 24 24",
		strokeWidth: "1.5",
		stroke: "currentColor",
		fill: "none",
		strokeLinecap: "round",
		strokeLinejoin: "round",
	},
	h("path", {
		stroke: "none",
		d: "M0 0h24v24H0z",
		fill: "none",
	}),
	h("line", {
		x1: "5",
		y1: "9",
		x2: "19",
		y2: "9",
	}),
	h("line", {
		x1: "5",
		y1: "15",
		x2: "19",
		y2: "15",
	}),
	h("line", {
		x1: "11",
		y1: "4",
		x2: "7",
		y2: "20",
	}),
	h("line", {
		x1: "17",
		y1: "4",
		x2: "13",
		y2: "20",
	})
);

const createSROnlyLabel = (text) => {
	const node = h(`span.sr-only`, `Section: ${text}`);
	node.properties["is:raw"] = true;
	return node;
};

// https://astro.build/config
/** @type {import('astro').AstroUserConfig} */
export default defineConfig({
	markdown: {
		remarkPlugins: ["remark-gfm", ["remark-smartypants", { dashes: false }]],
		rehypePlugins: [
			"rehype-slug",
			[
				"rehype-autolink-headings",
				{
					behavior: "before",
					properties: {
						className: "anchor-link",
					},
					group: ({ tagName }) =>
						h(`div.heading-wrapper.level-${tagName}`, { tabIndex: -1 }),
					content: (heading) => [
						h(
							`span.anchor-icon`,
							{
								ariaHidden: "true",
							},
							AnchorLinkIcon
						),
						createSROnlyLabel(toString(heading)),
					],
				},
			],
		],
		shikiConfig: {
			theme: "dracula",
			wrap: true,
		},
	},
	experimental: {
		integrations: true,
	},
	site: "https://www.astro-theme-cactus.netlify.app",
	integrations: [
		tailwind({
			config: { applyBaseStyles: false },
		}),
		sitemap(),
		robotsTxt(),
		astroImageTools,
	],
});
