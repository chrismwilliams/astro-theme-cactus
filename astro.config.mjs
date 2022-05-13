import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";

import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
/** @type {import('astro').AstroUserConfig} */
export default defineConfig({
  markdown: {
    rehypePlugins: [
      "rehype-slug",
      ["rehype-autolink-headings", { behavior: "append" }],
      [
        "rehype-toc",
        {
          /* https://github.com/JS-DevTools/rehype-toc */
        },
      ],
    ],
  },
  site: "https://www.example.com",
  integrations: [preact(), tailwind(), sitemap()],
});
