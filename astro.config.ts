import fs from "node:fs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import { expressiveCodeOptions } from "./src/site.config";

// Remark plugins
import remarkUnwrapImages from "remark-unwrap-images";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";
import remarkDirective from "remark-directive" /* Handle ::: directives as nodes */
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.ts"; /* Add directive label to node */

// Rehype plugins
import rehypeExternalLinks from "rehype-external-links";
import rehypeComponents from "rehype-components"; /* Render as components from the tree */
import Admonitions from "./src/plugins/rehype-component-admonition.ts" /* The admonition component */

import type { RehypeComponentData } from "@/types";


// https://astro.build/config
export default defineConfig({
	image: {
		domains: ["webmention.io"],
	},
	integrations: [
		expressiveCode(expressiveCodeOptions),
		icon(),
		tailwind({
			applyBaseStyles: false,
			nesting: true,
		}),
		sitemap(),
		mdx(),
	],
	markdown: {
		rehypePlugins: [
			[
				rehypeExternalLinks,
				{
					rel: ["nofollow, noreferrer"],
					target: "_blank",
				},
			],
      [rehypeComponents, {
        components: {
          "tip": (x: RehypeComponentData["properties"], y: RehypeComponentData["children"]) => Admonitions(x, y, "tip"),
					"note": (x: RehypeComponentData["properties"], y: RehypeComponentData["children"]) => Admonitions(x, y, "note"),
          "important": (x: RehypeComponentData["properties"], y: RehypeComponentData["children"]) => Admonitions(x, y, "important"),
          "caution": (x: RehypeComponentData["properties"], y: RehypeComponentData["children"]) => Admonitions(x, y, "caution"),
          "warning": (x: RehypeComponentData["properties"], y: RehypeComponentData["children"]) => Admonitions(x, y, "warning"),
        },
      }],
		],
		remarkPlugins: [remarkUnwrapImages, remarkReadingTime, remarkDirective, parseDirectiveNode],
		remarkRehype: {
			footnoteLabelProperties: {
				className: [""],
			},
		},
	},
	// https://docs.astro.build/en/guides/prefetch/
	prefetch: true,
	// ! Please remember to replace the following site property with your own domain
	site: "https://astro-cactus.chriswilliams.dev/",
	vite: {
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
		plugins: [rawFonts([".ttf", ".woff"])],
	},
});

function rawFonts(ext: string[]) {
	return {
		name: "vite-plugin-raw-fonts",
		// @ts-expect-error:next-line
		transform(_, id) {
			if (ext.some((e) => id.endsWith(e))) {
				const buffer = fs.readFileSync(id);
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
		},
	};
}
