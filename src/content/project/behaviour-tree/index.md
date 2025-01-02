---
title: "A Better Behaviour Tree - System"
description: "An improved behaviour tree from the SFAS contest. Made with C++."
publishDate: "15 Jun 2024"
coverImage:
    src: "./bt-cover.png"
    alt: "Code cover image"
tags: ["c++", "coroutines", "behaviour-trees", "tools-dev"]
draft: false
relatedPosts: []
---

Check out the
- 💾 [**Project Files**](https://github.com/HenryHa993/behaviour-tree-cpp)

## About
I recently found the opportunity to use and improve the behaviour tree system I made for the [**SFAS contest**](/projects/ghoul-prison/).

I identified some pain points when using it initially, but with the time restrictions of the competition, I didn't really have the time to solve them.

## Improvements
Here are some of the improvements I made:
1. **Decoupling**
	- Behaviour trees previously made using my framework had nodes that were heavily coupled to the entity they were controlling.
    - I wanted to alleviate that using a better blackboarding system, and stripping out the node class from the behaviour tree class.
	- This would help me make more modular nodes, which could be re-used across different game entities.
2. **Smart Pointers**
	- Nodes now use shared pointers so the tree will naturally de-allocate the nodes sequentially upon delete.
	- I re-use some nodes in my example behaviour tree, but as long as I don't create cycles, it should de-allocate just fine.
3. **Vectors instead of lists**
	- Initial implementation used lists instead of vectors. For composite nodes with only leaf nodes, there would be a performance benefit to traversing vectors instead. So I swapped out lists for vectors.

## How To Use
This was used in a different project, so it has references to a `GameEntity` which is not in the folder. Please swap these references out with your own AI/actor base class if you intend to use it.

For examples on it is used, see:
1. [`/ExampleBTs/`](https://github.com/HenryHa993/behaviour-tree-cpp/tree/main/ExampleBTs) for example behaviour trees.
2. [`/TaskNodes/`](https://github.com/HenryHa993/behaviour-tree-cpp/tree/main/TaskNodes) for example node services and actions.

## Related Posts