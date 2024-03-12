---
title: "Terminal Retrospective"
description: "A personal retrospective about the learnings of developing Terminal."
publishDate: "12 Mar 2024"
tags: ["unreal", "c++", "retro"]
draft: false
---

If you haven't read the project post for Terminal before reading this, please do so [**here**]()!

## Project Goals
Returning to this project, I had pretty big indicators on what to improve. Mainly on the animation and AI front.

As a base, I initially had a COD Zombies-like experience comprised with the following components:
1. Constructed **Level**
2. Basic AI Components
	- Zombie **Behaviour Tree**
	- Basic **Tasks** and **Services**
3. Basic Animation Components
	- **Blendspaces**
	- Basic **Animation BP**

Upon revisit, I thought it would be a fun technical challenge to deviate from a the basic COD AI and build out more life-like behaviours. As a result, I scrapped the AI and animation components, opting to re-implement them in C++ and improve them with other techniques.

Here are some nifty systems I wanted to learn coming into this project:

1. **Environment Query System**

	Unreal's EQS lets you query the **environment** for **data**, such as locations. I initially discovered this technique trying to implement a wall climber (that's for another time), and thought it would be perfect for building out behaviours such as hiding and strafing due to its useful filtering and scoring systems.

2. **Animation BP**

	Animation blueprinting was a pretty big weakness in my skills and something I wanted to understand better. As a result, I took the time to learn how the **Event Graph**, **Anim Graph** and **State Machines** tied together. Oh and **Blendspaces**.

3. **Layered Animations**

	The initial project has pretty rigid animations. When attacking, for example, the enemy would stand still and perform the full-body animation. This set a limitation on it's behaviour, as the lack of blending meant the running animation would stop when attacking mid-movement. I figured using layered animations would open up some possibilities in my behaviour tree development.

## What Went Well

1. **Assets**

	Having much of the asset work and decisions done previous streamlined the development a tremendous amount.

2. **Learning Goals**

	I am much more comfortable with **Animation Blueprints** and more complex animation techniques such as **Layered Animation**. This was initially a pretty big weakness of mine, so I am pretty proud. I also learned how to knit Unreal's **EQS** with behaviour trees to create some awesome behaviours.

3. **Playtesting**

	I brought in some friends in to playtest and got some awesome feedback. One notable adjustment is that I added a tooltip to guide the player to find and pick up the gun at the start.

4. **Asset File Structure**

	The initial folder structure for the assets was a hell-zone. I re-organised a lot of the content according to the [UE5 Style Guide](https://github.com/Allar/ue5-style-guide)

## What Didn't

1. **Script File Structure**

	I admittedly did not know you could organise CPP files into subfolders until I saw it in a video. It is embarrassing but it will be a cathartic experience organising my next projects.

2. **Damage Feedback**

	I got feedback that the response from hitting enemies was non-existent. I added a hit sound-effect to try alleviate this, which helped but I also wanted to implement an **additive damaged animation**. I was unfortunately unable to do this in time. Additive animations will probably go into my bucket list for things I want to include into a project.
