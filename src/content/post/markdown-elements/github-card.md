---
title: "GitHub Card"
description: "This post showcases using the markdown GitHub Card feature in Astro Cactus"
publishDate: "1 July 2025"
tags: ["markdown", "admonitions"]
---

## GitHub Repository Cards
You can add dynamic cards that link to GitHub repositories, on page load, the repository information is pulled from the GitHub API.

::github{repo="chrismwilliams/astro-theme-cactus"}

You can also link a Github user:

::github{user="withastro"}

To use this feature you just use the "Github" directive:

```markdown
::github{repo="chrismwilliams/astro-theme-cactus"}

::github{user="withastro"}
