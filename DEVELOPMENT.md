# Development

This repo is configured to use Bun.

## Commands

- Dev: bun run dev
- Build: bun run build
- Preview: bun run preview
- Install deps: bun install

## Notes

- Client components: use client:load or client:visible when importing React/TSX into .astro files.
- Image performance: prefer Astro <Image /> for static images. The PixelImage component uses background slices (no <img>) to avoid console hints while animating.
- Navigation: desktop hover effect is link-scoped; adjust styles in src/components/layout/Header.astro.
- MagicUI components used: marquee, pixel-image, retro-grid, scroll-based-velocity.

## Upstream sync (cactus theme)

Remote upstream → chrismwilliams/astro-theme-cactus

- Compare: git fetch --all --prune && git log --oneline --left-right origin/main...upstream/main
- Create sync branch: git checkout -b chore/sync-upstream-<version> origin/main && git merge upstream/main
- Resolve conflicts, test, then merge to dev
