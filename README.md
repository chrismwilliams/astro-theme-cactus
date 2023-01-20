<div align="center">
  <img alt="Astro Theme Cactus logo" src="./gh-assets/astro-cactus-logo.png" width="70" />
</div>
<h1 align="center">
  🚀 Astro Theme Cactus 🌵
</h1>

Astro Theme Cactus is a simple opinionated starter built with the Astro framework. Use it to create an easy-to-use blog or website.

## Key Features

- Astro Fast 🚀
- TailwindCSS Utility classes
- Accessible, semantic HTML markup
- Responsive & SEO-friendly
- Dark / Light mode, using Tailwind and CSS variables
- [Astro Image Integration](https://docs.astro.build/en/guides/integrations-guide/image/) for optimised images
- MD & [MDX](https://docs.astro.build/en/guides/markdown-content/#mdx-only-features) posts
- Pagination
- [Automatic RSS feed](https://docs.astro.build/en/guides/rss)
- Shiki code syntax styling
- Auto-generated [sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)

## Demo 💻

Check out the [Demo](https://astro-theme-cactus.netlify.app/), hosted on Netlify

## Quick start

[Create a new repo](https://github.com/chrismwilliams/astro-theme-cactus/generate) from this template.

[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/chrismwilliams/astro-theme-cactus) [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchrismwilliams%2Fastro-theme-cactus&project-name=astro-theme-cactus)

## Commands

Replace pnpm with your choice of npm / yarn

| Command        | Action                                                         |
| :------------- | :------------------------------------------------------------- |
| `pnpm install` | Installs dependencies                                          |
| `pnpm dev`     | Starts local dev server at `localhost:3000`                    |
| `pnpm build`   | Build your production site to `./dist/`                        |
| `pnpm preview` | Preview your build locally, before deploying                   |
| `pnpm sync`    | Generate types based on your config in `src/content/config.ts` |

## Configure

- Edit the config file `src/site.config.ts` for basic site meta data
- Update file `astro.config.ts` site property with your own domain
- Replace & update files within the `/public` folder:
  - favicon.ico & other social icons
  - robots.txt - update the Sitemap url to your own domain
  - manifest.webmanifest
- Modify file `src/styles/global.css` with your own light and dark styles
- Create / edit posts for your blog within `src/content/post/` with .md/mdx file(s). See below for more details.
- Optional:
  - Fonts: This theme sets the body element to the font family `font-mono`, located in the global css file `src/styles/global.css`. You can change fonts by removing the variant `font-mono`, after which TailwindCSS will default to the `font-sans` [font family stack](https://tailwindcss.com/docs/font-family).

## Adding posts

This theme utilises [Content Collections](https://docs.astro.build/en/guides/content-collections/) to organise Markdown and/or MDX files, as well as type-checking frontmatter with a schema -> `src/content/config.ts`.

Adding a post is a simple as adding your .md(x) file(s) to the `src/content/post` folder, the filename of which will be used as the slug/url. The two posts included with this template are there as an example of how to structure your frontmatter. Additionally, the [Astro docs](https://docs.astro.build/en/guides/markdown-content/) has a detailed section on markdown pages.

### Frontmatter

| Property (\* required) | Description                                                                                                                                                                       |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| title \*               | Self explanatory. Used as the text link to the post, the h1 on the posts' page, and the pages title property. Has a max length of 60 chars, set in `src/content/config.ts`        |
| description \*         | Similar to above, used as the seo description property. Has a min length of 50 and a max length of 160 chars, set in the post schema.                                             |
| publishDate \*         | Again pretty simple. To change the date format/locale, currently **en-GB**, update/pass the **locale** arg to function **getFormattedDate**, found in `src/utils/date.ts`.        |
| tags                   | Tags are optional with any created post. Any new tag(s) will be shown in `yourdomain.com/posts` + `yourdomain.com/tags`, and generate the page(s) `yourdomain.com/tags/[yourTag]` |

## Deploy

[Astro docs](https://docs.astro.build/en/guides/deploy/) has a great section and breakdown of how to deploy your own Astro site on various platforms and their idiosyncrasies.

By default the site will be built (see Commands section above) to a `/dist` directory.

## Acknowledgment

This theme is inspired by [Hexo Theme Cactus](https://github.com/probberechts/hexo-theme-cactus)

## License

Licensed under the MIT License, Copyright © 2022
