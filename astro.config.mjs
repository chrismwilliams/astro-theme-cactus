import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import solid from "@astrojs/solid-js";

// https://astro.build/config
/** @type {import('astro').AstroUserConfig} */
export default defineConfig({
	markdown: {
		remarkPlugins: ["remark-code-titles"],
		rehypePlugins: [
			"rehype-slug",
			[
				"rehype-autolink-headings",
				{
					behavior: "prepend",
				},
			],
		],
		shikiConfig: {
			theme: "dracula",
			wrap: true,
		},
	},
	site: "https://www.astro-cactus.netlify.app",
	integrations: [tailwind(), sitemap(), solid()],
});
