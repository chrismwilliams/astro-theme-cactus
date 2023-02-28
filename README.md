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
- [Satori](https://github.com/vercel/satori) for creating open graph png images.
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
- Edit social links in `src/data/constants.ts` and in turn `src/components/SocialList.astro` to add/replace your media profile. Icons used can be found @ [tablericons](https://tablericons.com/)
- Create / edit posts for your blog within `src/content/post/` with .md/mdx file(s). See [below](#adding-posts) for more details.
- OG Image:
  - If you would like to change the style of the generated image the Satori library creates, open up `src/pages/og-image/[slug].png.ts` to the markup function where you can edit the html/tailwind-classes as necessary. You can also use this [satori playground](https://og-playground.vercel.app/) to aid your design.
  - If you would like to generate svg og images rather than the default .png ones, you will need to remove the @resvg/resvg-js library, and return the svg within the body of the get function from the file `src/pages/og-image/[slug].png.ts`.
  - You can also create your own og images and skip satori generating if for you by adding an ogImage property in the frontmatter with a link to the asset, an example can be found in `src/content/post/social-image.md`. More info on frontmatter can be found [here](#frontmatter)
- Optional:
  - Fonts: This theme sets the body element to the font family `font-mono`, located in the global css file `src/styles/global.css`. You can change fonts by removing the variant `font-mono`, after which TailwindCSS will default to the `font-sans` [font family stack](https://tailwindcss.com/docs/font-family).

## Adding posts

This theme utilises [Content Collections](https://docs.astro.build/en/guides/content-collections/) to organise Markdown and/or MDX files, as well as type-checking frontmatter with a schema -> `src/content/config.ts`.

Adding a post is a simple as adding your .md(x) file(s) to the `src/content/post` folder, the filename of which will be used as the slug/url. The two posts included with this template are there as an example of how to structure your frontmatter. Additionally, the [Astro docs](https://docs.astro.build/en/guides/markdown-content/) has a detailed section on markdown pages.

### Frontmatter

| Property (\* required) | Description                                                                                                                                                                                                                                                                                       |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| title \*               | Self explanatory. Used as the text link to the post, the h1 on the posts' page, and the pages title property. Has a max length of 60 chars, set in `src/content/config.ts`                                                                                                                        |
| description \*         | Similar to above, used as the seo description property. Has a min length of 50 and a max length of 160 chars, set in the post schema.                                                                                                                                                             |
| publishDate \*         | Again pretty simple. To change the date format/locale, currently **en-GB**, update/pass the **locale** arg to function **getFormattedDate**, found in `src/utils/date.ts`.                                                                                                                        |
| tags                   | Tags are optional with any created post. Any new tag(s) will be shown in `yourdomain.com/posts` + `yourdomain.com/tags`, and generate the page(s) `yourdomain.com/tags/[yourTag]`                                                                                                                 |
| ogImage                | This is an optional property. An OG Image will be generated automatically for every post where this property **isn't** provided. If you would like to create your own for a specific post, include this property and a link to your image, the theme will then skip automatically generating one. |

## Analytics

You may want to track the number of visitors you receive to your blog/website in order to understand trends and popular posts/pages you've created. There are a number of providers out there one could use, including web hosts such as [vercel](https://vercel.com/analytics), [netlify](https://www.netlify.com/products/analytics/), and [cloudflare](https://www.cloudflare.com/web-analytics/).

This theme/template doesn't include a specific solution due to there being a number of use cases and/or options which some people may or may not use.

You may be asked to included a snippet inside the **HEAD** tag of your website when setting it up, which can be found in `src/layouts/Base.astro`. Alternatively, you could add the snippet in `src/components/BaseHead.astro`.

Another popular provider is google analytics which you could integrate via the above method, or, for example adding [astro-google-analytics](https://www.npmjs.com/package/astro-google-analytics)

```bash
pnpm install astro-google-analytics
```

Edit `src/layouts/Base.astro`, and add:

```tsx
---
import { GoogleAnalytics } from 'astro-google-analytics';
// ...other imports
---

<head>
  <!-- Replace id with your own Google Analytics ID -->
  <GoogleAnalytics id="G-XXXXXXXXXX" />
</head>
```

## Deploy

[Astro docs](https://docs.astro.build/en/guides/deploy/) has a great section and breakdown of how to deploy your own Astro site on various platforms and their idiosyncrasies.

By default the site will be built (see [Commands](#commands) section above) to a `/dist` directory.

## Acknowledgment

This theme is inspired by [Hexo Theme Cactus](https://github.com/probberechts/hexo-theme-cactus)

## License

MIT
