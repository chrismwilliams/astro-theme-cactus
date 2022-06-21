---
layout:
setup: |
  import Layout from '@/layouts/BlogPost'
title: My Second Post
publishDate: 12 June 2022
description: It's another post by me.
tags:
  - example
  - blog
value: 128
---

## This is so cool!

<!-- prettier-ignore -->
Do variables work {frontmatter.value * 2}?

```javascript
// Example JavaScript

const x = 7;
function returnSeven() {
	return x;
}
```
