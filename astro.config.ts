import fs from "node:fs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";
import remarkUnwrapImages from "remark-unwrap-images";

import { expressiveCodeOptions } from "./src/site.config";
import { remarkReadingTime } from "./src/utils/remark-reading-time";

// https://astro.build/config
export default defineConfig({
  site: "https://kvncyf.me/",
  image: { domains: ["kvncyf.me"] },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    icon(),
    expressiveCode(expressiveCodeOptions),
    react(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["not-prose"] } }],
      [rehypeExternalLinks, { rel: ["noreferrer", "noopener"], target: "_blank" }],
    ],
    remarkPlugins: [remarkUnwrapImages, remarkReadingTime],
    remarkRehype: {
      footnoteLabelProperties: { className: [""] },
    },
  },
  vite: {
    define: {
      "import.meta.env.PUBLIC_APP_URL": JSON.stringify(process.env.PUBLIC_APP_URL),
    },
    optimizeDeps: { exclude: ["@resvg/resvg-js"] },
    plugins: [rawFonts([".ttf", ".woff"])],
  },
});
function rawFonts(ext: string[]) {
  return {
    name: "vite-plugin-raw-fonts",
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error:next-line
    transform(_, id) {
      if (ext.some((e: unknown) => id.endsWith(e))) {
        const buffer = fs.readFileSync((id as fs.PathOrFileDescriptor));
        return {
          code: `export default ${JSON.stringify(buffer)}`,
          map: null
        };
      }
    }
  };
}