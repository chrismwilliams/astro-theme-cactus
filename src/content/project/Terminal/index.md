---
title: "Terminal - Horror Shooter"
description: "A horror shooter game with an emphasis on AI behaviour trees. Built using UE5 and C++."
publishDate: "11 Feb 2024"
coverImage:
    src: "./TerminalCover.png"
    alt: "Terminal cover image"
tags: ["unreal", "c++", "ai", "behaviour-trees"]
draft: false
relatedPosts: ["terminal-retro"]
---

Check out **Terminal's**
- [**Game Page**](https://henryha993.itch.io/terminal)
- [**Project Files**](https://github.com/HenryHa993/MBShooter)

## About
Terminal is a horror shooter made using **C++** and **UE5**. This project contains 4 *unique* enemies, which undergo different animations and AI.

This is a personal remake of a group project made during my time at [The Developer Academy's](https://thedeveloperacademy.com/) Unreal Engine 5 training. Big thanks to [**Clayton Rist**](https://www.linkedin.com/in/clayton-rist-027185171/?originalSubdomain=uk) who contributed with level construction and some sound work.

This project was initially a zombie shooter with bare-bones AI and animation implementation. Upon revisit, I wanted to improve on those fronts and develop behaviours which take advantage of **layered animations** and Unreal Engine's **EQS**.

Most of these components are done using C++ and may be documented below in the **Related Posts** section.

## Techniques
The primary focus of this project was to make believable and varied behaviours. Below you can see some of the techniques used to achieve the enemies you see in Terminal.

**Artificial Intelligence**
1. Behaviour Trees
2. Environment Query System

**Animation**
1. Animation Blueprints
    - State Machines
    - Event Graphs
2. Anim Notifiers
3. Layered Animations
5. Blendspaces

**Languages and Tools**
1. C++
    - Delegates
2. Blueprints (Mostly for UI)
    - Event Dispatchers
3. Perforce

## Related Posts