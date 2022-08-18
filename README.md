<p align="center">
  <img alt="Astro Theme Cactus logo" src="./public/images/astro-theme-cactus.png" width="70" />
</p>
<h1 align="center">
  Astro Theme Cactus 🚀🌵
</h1>

> Astro Theme Cactus is a simple opinionated starter built with the Astro framework. Use it to create an easy-to-use blog or website.

### 💻 [Live Demo](https://astro-theme-cactus.netlify.app/) hosted on Netlify

## Features

Made with Astro, Typescript, Tailwind CSS & SolidJS

- Astro Fast 🚀
- Accessible, semantic HTML markup
- Responsive & SEO-friendly
- [Astro ImageTools](https://github.com/RafidMuhymin/astro-imagetools#readme) for optimised images
- MDX posts
- Pagination
- Theming colour modes with Tailwind and CSS variables
- Shiki code syntax styling
- Auto-generated sitemap & robots.txt

## Quick start

[Create a new repo](https://github.com/chrismwilliams/astro-theme-cactus/generate) from this template.

[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/chrismwilliams/astro-theme-cactus) [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchrismwilliams%2Fastro-theme-cactus&project-name=astro-theme-cactus)

## Commands

Replace pnpm with your choice of npm / yarn

| Command        | Action                                       |
| :------------- | :------------------------------------------- |
| `pnpm install` | Installs dependencies                        |
| `pnpm dev`     | Starts local dev server at `localhost:3000`  |
| `pnpm build`   | Build your production site to `./dist/`      |
| `pnpm preview` | Preview your build locally, before deploying |

## Configure

- Edit config file `src/site-meta.config.ts` for basic site meta data
- Update file `astro.config.mjs` site property with your own domain
- Replace & update files within the `/public` folder:
  - favicon.ico
  - manifest.webmanifest
  - `public/images` folder
- Modify file `src/styles/global.css` with your own light and dark styles
- Create / edit posts for your blog within `src/pages/posts/` with .md file(s)

## Adding posts

Adding a post is a simple as adding your .mdx file(s) to the `src/pages/posts/` folder, the name of which will be used as the slug/url. The two posts included with this template can be modified, and give you an example of how to structure your posts. [Astro docs](https://docs.astro.build/en/guides/markdown-content/) also has a detailed section on markdown pages.

### Frontmatter

| Property (\* required) | Description                                                                                                                                                                                   |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| layout                 | This is used to import [Markdown Layouts](https://docs.astro.build/en/core-concepts/layouts/#markdown-layouts), this theme uses `src/layouts/BlogPost.astro` as a wrapper for all blog posts. |
| title \*               | Self explanatory. Used as the text link to the post, the h1 on the posts' page, and the pages' title property                                                                                 |
| description \*         | Similar to above, used as the seo description property                                                                                                                                        |
| publishDate \*         | Again pretty simple. To change the date format/locale, currently **en-GB**, update/pass the **locale** arg to function **getLocaleTime**, found in `src/util.ts`.                             |
| tags                   | Tags are optional. Any new tag(s) will be shown in `yourdomain.com/posts` + `yourdomain.com/tags`, and generate the page(s) `yourdomain.com/tags/[yourTag]`                                   |

## Deploy

[Astro docs](https://docs.astro.build/en/guides/deploy/) has a great section and breakdown of how to deploy your own Astro site on various platforms and their idiosyncrasies.

By default the site will be built (see Commands section above) to a `/dist` directory.

## Acknowledgment

This theme is inspired by [Hexo Theme Cactus](https://github.com/probberechts/hexo-theme-cactus)

## License

Licensed under the MIT License, Copyright © 2022
