# Repository rules and maintenance guide

This project is a customized fork of astro-theme-cactus. We periodically pull upstream improvements while keeping the site intact.

## Branching
- main: production
- dev: staging for features
- chore/sync-upstream-<version>: upstream sync branches

## Upstream
- Remote upstream → https://github.com/chrismwilliams/astro-theme-cactus
- Compare: git fetch --all --prune && git log --oneline --left-right origin/main...upstream/main
- Start sync: git checkout -b chore/sync-upstream-<version> origin/main && git merge --no-ff upstream/main

## Low-risk ports already applied
- src/layouts/Base.astro: add speculation rules <script type="speculationrules"> and scroll-smooth class
- src/components/BaseHead.astro: improved canonical, RSS, icons/manifest, webmentions
- astro.config.ts:
  - Ensure astro-expressive-code is before @astrojs/mdx
  - Add rehype-slug + rehype-autolink-headings
  - Keep Tailwind v3 + React integrations
- Dependencies added: rehype-autolink-headings, rehype-slug, rehype-unwrap-images
- Build verified: pnpm build

## Future upgrades (optional)
- Consider upstream robots/webmanifest integrations
- Tailwind v4 migration and Astro v5+ alignment
- Port src/plugins/* remark utilities if/when needed

## Notes
- Prefer our content and custom components over upstream demos
- Resolve conflicts file-by-file; keep the website behavior intact
