import { react } from '@astrojs/react';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import mdx from "@astrojs/mdx";
import react from '@astrojs/react';
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import fs from "node:fs";
import rehypeExternalLinks from "rehype-external-links";
import remarkUnwrapImages from "remark-unwrap-images";

import { expressiveCodeOptions } from "./src/site.config";
import { remarkReadingTime } from "./src/utils/remark-reading-time";

// https://astro.build/config
export default defineConfig({
  image: {
    domains: ["kvncyf.me"]
  },
  integrations: 
    [tailwind({
      applyBaseStyles: false
    }),
    icon(),
    react()],
  // ! Please remember to replace the following site property with your own domain
  markdown: {
    rehypePlugins: [[rehypeExternalLinks, {
      rel: ["nofollow, noopener, noreferrer"],
      target: "_blank"
    }]],
    remarkPlugins: [remarkUnwrapImages, remarkReadingTime],
    remarkRehype: {
      footnoteLabelProperties: {
        className: [""]
      }
    }
  },
  // https://docs.astro.build/en/guides/prefetch/
  prefetch: true,
  site: "https://kvncyf.me/",
  vite: {
    define: {
      'import.meta.env.PUBLIC_APP_URL': JSON.stringify(process.env.PUBLIC_APP_URL)
    },
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"]
    },
    plugins: [rawFonts([".ttf", ".woff"])]
  }
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