
let __unconfig_data;
let __unconfig_stub = function (data = {}) { __unconfig_data = data };
__unconfig_stub.default = (data = {}) => { __unconfig_data = data };
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";
import sitemap from "@astrojs/sitemap";
import remarkGfm from "remark-gfm"

const __unconfig_default =  defineConfig({
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

if (typeof __unconfig_default === "function") __unconfig_default(...[]);export default __unconfig_data;