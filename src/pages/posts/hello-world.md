---
setup: |
  import Layout from '@/layouts/BlogPost'
title: Hello World!
publishDate: 13 May 2022
description: Hello world!!! This is an example blog post showcasing some of the cool stuff Astro Cactus theme can do.
tags:
  - example
  - blog
  - cool
---

## Hello World

Following is an example blog post written in an md file. You can find me @ src/pages/posts/hello-world.md. Here you can add/update/delete details and watch the changes live when running in develop mode.

## Using some markdown elements

Here we have a simple js code block.

```js
let string = "JavaScript syntax highlighting";
```

This is styled by [Shiki](https://docs.astro.build/en/guides/markdown-content/#syntax-highlighting)

You can choose your own theme from this library, currently set to Dracula, in the file `astro.config.mjs`.

Here is a horizontal rule

---

Here is a list

- Item number 1
- Item number 2
- Item number 3

And an ordered list

1. James Madison
2. James Monroe
3. John Quincy Adams

Here is a table

| Item         | Price | # In stock |
| ------------ | :---: | ---------: |
| Juicy Apples | 1.99  |        739 |
| Bananas      | 1.89  |          6 |

## Tailwind CSS Prose styling

> I'm a simple blockquote.
> I'm styled by Tailwind CSS prose plugin
