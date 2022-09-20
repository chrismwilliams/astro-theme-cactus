import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";
import sitemap from "@astrojs/sitemap";
import remarkGfm from "remark-gfm"

export default defineConfig({
	site: "https://www.astro-theme-cactus.netlify.app",
	integrations: [
		mdx({
			remarkPlugins:[[remarkGfm, {}]]
		}),
		tailwind({
			config: { applyBaseStyles: false },
		}),
		image(),
		sitemap(),
	],
});
