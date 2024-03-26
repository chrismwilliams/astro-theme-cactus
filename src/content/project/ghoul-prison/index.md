---
title: "Escape Ghoul Prison - SFAS Competition Finalist"
description: "An intense observation game which implements my own behaviour tree implementation, built with C++ and Directx only."
publishDate: "21 Jan 2024"
coverImage:
    src: "./ghoul-prison-cover.png"
    alt: "Ghoul prison cover image"
tags: ["directx", "c++", "ai", "behaviour-trees"]
draft: false
relatedPosts: ["sfas-retro"]
---

Check out **Escape Ghoul Prison's**
- 🕹️ [**Game Page/Development Document**](https://henryha993.itch.io/escape-ghoul-prison)
- 💾 [**Project Files**](https://github.com/HenryHa993/EscapeGhoulPrison)

## About
Escape Ghoul Prison is a puzzle observation game made using only **C++** and **DirectX**. In this project, I implement my very own **behaviour tree system** using modern C++ techniques such as **coroutines**.

This is a submission to **Grads In Game's Search For a Star 2024** competition, in which I became a [**finalist**](https://gradsingames.com/search-for-a-star/sfas-2024-the-finalists/#prog) for!

This project was scored and rated by a vast range of [industry professionals](https://gradsingames.com/search-for-a-star/sfas-2024-the-finalists/#prog) and was an incredibly fun technical challenge. I received some awesome feedback for this project, so I wrote a separate learnings post [**here**](/posts/sfas-retro/).

![Ghoul Prison GIF](https://img.itch.zone/aW1nLzE0NzM5ODQwLmdpZg==/original/mEFfqR.gif)

## Techniques
Coming into this competition, I really wanted to work on some sort of AI behaviour. Having previously worked with **behaviour trees** in **UE5** and **Unity**, I decided to make my very own from scratch!

### C++
1. **Coroutines**
    - Having previous experience with coroutines in **C#** and **Unity** made me comfortable enough to pick up and utilise it in this project for the **behaviour tree** implementation.
    - In specific, coroutines were used to implement the `RUNNING` return state, which means that a specific node hasn't finished operating within that tick and must continue to run in the next update cycle.
    - This is a modern **C++ 20** technique.
    - See [`Source/Engine/Implementation/BehaviourTree`](https://github.com/HenryHa993/EscapeGhoulPrison/tree/main/Source/Engine/Implementation/BehaviourTree)

2. **Behaviour Tree**
    - Features of the behaviour tree included: **Selector Nodes**, **Sequence Nodes**, **Services** and **RUNNING State functionality**.
    - This implementation is used for the AI of the prison warden in the game.
    - See [`Source/Engine/Implementation/BehaviourTree`](https://github.com/HenryHa993/EscapeGhoulPrison/tree/main/Source/Engine/Implementation/BehaviourTree)
3. **Sprite System**
    - Built out a sprite script in order to manage multiple different billboards under a single object.
    - This was used for the stage indicators on the left, as well as the prison warden's sprite changes and detection indicator.
    - See [`Source/Engine/Implementation/GameObjects`](https://github.com/HenryHa993/EscapeGhoulPrison/tree/main/Source/Engine/Implementation/GameObjects)

### Artificial Intelligence
1. **WardenBT**
    - Based off my behaviour tree, I built out a few **task nodes** and **services** to construct the patrolling behaviour of the prison warden.
    - See [`Source/Game/EnemyBTs`](https://github.com/HenryHa993/EscapeGhoulPrison/tree/main/Source/Game/EnemyBTs)

### Version Control
1. **GitHub**

## Related Posts