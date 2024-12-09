---
title: "Markdown Extended Features"
description: "This post showcases using the markdown admonition feature in Astro Cactus"
publishDate: "12 4 2024"
tags: ["markdown", "admonitions"]
---

## GitHub Repository Cards
You can add dynamic cards that link to GitHub repositories, on page load, the repository information is pulled from the GitHub API.

::github{repo="https://github.com/Fabrizz/MMM-OnSpotify"}

You can also link a Github user:

::github{repo="Fabrizz"}

To use this feature you just use the "Github" directive:

```markdown
::github{repo="Fabrizz/MMM-OnSpotify"}
::github{repo="https://github.com/Fabrizz"}

::github{user="Fabrizz"}
::github{user="https://github.com/Fabrizz"}
```