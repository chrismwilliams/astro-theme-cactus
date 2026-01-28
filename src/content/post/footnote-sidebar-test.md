---
title: "Footnote sidebar demo"
description: "Verifies footnotes can float to the right while TOC stays hidden."
publishDate: "28 Jan 2026"
updatedDate: "28 Jan 2026"
tags: ["test", "footnote", "layout"]
footnotesSidebar: true
tocSidebar: false
---

This paragraph references a source for the first time.[^first] Scroll a bit more to see how the sidebar follows.

Add another section with a second reference farther down, with some filler text to separate the anchors and test spacing.[^second] The goal is to visually check that the right-rail footnotes line up with the first footnote marker, and that the table of contents stays hidden.

Keep going with a third reference after a longer block of content so the distance between references grows.[^third]

Interleave some list content to vary heights:

- Item A with a nested reference marker.[^fourth]
- Item B continues the list.
- Item C ends the list.

Here is a paragraph that precedes a fourth inline reference to see stacked alignment in quick succession.[^fifth]

Insert a medium block of text to create a larger vertical gap. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non neque quis nibh commodo pulvinar. Integer euismod, nibh quis volutpat efficitur, nunc odio interdum metus, vitae feugiat est massa vel dui. Phasellus porta risus metus, eu luctus neque scelerisque eget. Suspendisse potenti. Donec id dui ut arcu viverra dictum quis vitae dui.

Another short paragraph with bold and code to alter height: **bold bits here** and `const x = 42;` plus some inline math-looking text like `a^2 + b^2 = c^2`.

Finish with a final line to confirm the sidebar still leaves space below the last item.[^sixth]

[^first]: First sidebar footnote to check alignment.
[^second]: Second sidebar footnote; confirms list formatting and spacing.
[^third]: Third sidebar footnote; placed further down to test larger gaps.
[^fourth]: Fourth sidebar footnote attached to the list.
[^fifth]: Fifth sidebar footnote placed after dense text to test larger offsets.
[^sixth]: Sixth sidebar footnote near the end for final spacing check.
