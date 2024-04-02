---
title: "Rixa - Group Project"
description: "A retro top-down shooter inspired by Commando on the C64. Made with C++ and Playbuffer."
publishDate: "2 Apr 2024"
coverImage:
    src: "./rixa-cover.png"
    alt: "Rixa cover image"
tags: ["c++", "group-project"]
draft: false
relatedPosts: []
---

Check out **Rixa's**
- 🕹️ [**Game Page/Development Document**](https://henryha993.itch.io/rixa)
- 💾 [**Project Files**](https://github.com/d7kh3ty/rixa/tree/main)

## About
Rixa is a retro, top-down shooter inspired by Commando on the C64. This was originally a group project done under the Developer Academy but I recently decided to overhaul it as I recently got some amazing C++ [**feedback**](/posts/sfas-reto/) and thought it was a good chance to reinforce some learning.

This was made using **C++** and Sumo Digital's **Playbuffer** library.

![Rixa GIF](https://img.itch.zone/aW1nLzE1NjIxNjY3LmdpZg==/original/E3sMov.gif)

**Note**: This project codebase is still WIP, as some improvements based on the feedback are still on the way.

## Refactoring
The original codebase was admittedly very messy, and a major reason why this project was not previously included in my portfolio. This was due to a number of reasons, but the main ones were time constraints and being part of quite a large team at the time. Here were some of the key improvements I wanted to make to the codebase:

1. Separate functionality into more classes.
    - The `Main.cpp` originally had over 1000 lines of code and needed some severe refactoring.
    - See [**Overhauling commit**](https://github.com/d7kh3ty/rixa/commit/879c57091c36d4994a33f6861b57da2eb35cfc4e)
2. De-allocating of dynamically allocated memory
    - De-allocating memory when projectiles and enemies were destroyed. Or when specific game states occured.
3. Swapping out enum types for the enum class
    - For reasons mentioned in this article [^1].

[^1]: [Enum Classes in C++ and Their Advantage over Enum Data Type](https://www.geeksforgeeks.org/enum-classes-in-c-and-their-advantage-over-enum-datatype/), GeeksForGeeks

----

The following is to-do:

4. Class based game states.
5. HUD
6. Action-based input system.
7. Filling in missing assertions.

## Related Posts