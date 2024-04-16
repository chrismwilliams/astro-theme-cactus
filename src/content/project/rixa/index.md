---
title: "Rixa - Top-Down Shooter"
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
- 🕹️ [**Game Page**](https://henryha993.itch.io/rixa)
- 💾 [**Project Files**](https://github.com/d7kh3ty/rixa/tree/main)

## About
Rixa is a retro, top-down shooter inspired by Commando on the C64. This was originally a group project done under the Developer Academy last year. I decided to overhaul it as I recently got some amazing C++ [**feedback**](/posts/sfas-retro/) and thought it was a great chance to put it into practise.

This was made using **C++** and Sumo Digital's **Playbuffer** library.

![Rixa GIF](https://img.itch.zone/aW1nLzE1NjIxNjY3LmdpZg==/original/E3sMov.gif)

## Refactoring
The original codebase was admittedly very messy -- a reason why this project was not previously included in my portfolio. This was due to a number of reasons, but the main one was time constraints.

It was also our introduction to C++ games development, so some fundamental C++ practices were missing. E.G., Heap memory de-allocation, const correctness and others.

If you want to see a side-by-side, check out the last two overhaul commits:
1. [Initial Overhaul](https://github.com/d7kh3ty/rixa/commit/879c57091c36d4994a33f6861b57da2eb35cfc4e)
2. [Final(?) Changes](https://github.com/d7kh3ty/rixa/commit/e07f68bad49c354b7dc4685ccdb9c66a010a4265)

Here are some of the improvements I made to the codebase:

### Implementation
1. **Projectiles**
    - `Projectiles` initially didn't have their own class and were handled by the game object that spawned them.
    - Now broken down into `PlayerProjectile` and `EnemyProjectile` which inherit from the `Projectile` class.
    - The `ProjectileManager` is a static class which handles updating all the projectiles.
    - `Projectiles` have references to the owner that spawns them, which allows me to apply enemy specific attack ranges and damage. This is instead of having the `Enemy` and `Player` manage them directly in order to apply the same.

        See [`RIXA/Source/Manager/ProjectileManager.cpp`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Manager/ProjectileManager.cpp)

        See in `RIXA/Source/Actor/`:
        1. [`Projectile`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Actor/Projectile.cpp)
        2. [`EnemyProjectile`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Actor/EnemyProjectile.cpp)
        3. [`PlayerProjectile`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Actor/PlayerProjectile.cpp)

2. **Enemies**
    - Broken down into different enemy classes which inherit from the `Enemy` class.
    - This is less verbose than the original `switch` statement used to construct different enemies depending on type given to the constructor.
    - They are now updated via the `EnemyManager` class, instead of being maintained in collection in the `Main.cpp`.
    
        See [`RIXA/Source/Manager/EnemyManager.cpp`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Manager/EnemyManager.cpp)
        
        See in `RIXA/Source/Actor/`:
        1. [`Enemy`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Actor/Enemy.cpp)
        2. [`TankEnemy`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Actor/TankEnemy.cpp)
        3. [`TrackedEnemy`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Actor/TrackedEnemy.cpp)
        4. [`TurretEnemy`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Actor/TurretEnemy.cpp)
        5. [`DroneEnemy`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Actor/DroneEnemy.cpp)

3. **Player**
    - `Player` originally was not managed by its own class, but in the `Main.cpp`.
    - It now inherits from the `Character` class which contains common functions required by both the `Player` and `Enemy` to override.
    
        See [`RIXA/Source/Actor/Player.cpp`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Actor/Player.cpp)

        See[`RIXA/Source/Actor/Character.cpp`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Actor/Character.cpp)

4. **Particles**
    - Decided to expand the explosion effect functions into it's own `ParticleManager` system.
    - This allows you draw a sprite animation at a given position. After it's animation finishes, it destroys itself.
    - This is done for the damage and explosion effects in the game.
    
        See [`RIXA/Source/Manager/ParticleManager.cpp`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Manager/ParticleManager.cpp)

5. **GameModes**
    - Implemented class-based game states.
    - Helpful for reloading the game, as the `Game.cpp` deconstructor is used to free game-related heap memory.
    
        See [`RIXA/Source/GameMode/`](https://github.com/d7kh3ty/rixa/tree/main/RIXA/Source/GameMode)

### Additions/Balancing
Here are some other additions I made outside of refactoring.

1. **Win/Lose States**
    - You could only die in the original prototype.
    - Added win state when reaching the end of the level.

        See [`RIXA/Source/GameMode`](https://github.com/d7kh3ty/rixa/tree/main/RIXA/Source/GameMode)

2. **Restart**
    - After reaching the win/lose states, you can press space to restart.

        See [`RIXA/Source/Main.cpp`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Main.cpp)

3. **Balancing**
    - Enemy stats were reworked to make them feel different from each other.
    - Enemy bullet sizes now correlate to the amount of damage they deal.
4. **Camera Lerping**
    - Added lerping to make camera movement more smooth.
    - By far my favourite addition.

        See [`RIXA/Source/Camera/Camera.cpp`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Camera/Camera.cpp)

5. **Bullet Animations**
    - Enemy bullets now play a despawn animation instead of suddenly dissapearing when out of range or hitting the player.

        See [`RIXA/Source/Actor/Projectile.cpp`](https://github.com/d7kh3ty/rixa/blob/main/RIXA/Source/Actor/Projectile.cpp)

6. **Sounds**
    - Added shooting and hit sounds to make gameplay feel more impactful.

### C++ Best Practises
1. **Replacing Enum DataType w/ Enum Class**
    - For reasons mentioned in the [SFAS Feedback](/posts/sfas-retro/).
    - Done for `GameState` and `Direction` enums.
2. **Replacing Pointers**
    - Most functions or classes assumed the pointers used would not be `null`, so it made sense to swap them out with references where applicable.
3. **De-allocate Heap Memory**
    - Re-implementation of new `Projectile` and `Enemy` classes meant they had to be correctly de-allocated.
4. **Const Correctness**
    - For functions and inputs where applicable.

### Structure
1. **Separate Functionality**
    - The `Main.cpp` originally had over 1000 lines of code and needed some severe refactoring.
    - Splitting it out into different classes allowed me to modularize and re-implement components better.
    - Additions: [Game Modes](https://github.com/d7kh3ty/rixa/tree/main/RIXA/Source/GameMode), [Actor/Enemy/Player/Projectile Classes](https://github.com/d7kh3ty/rixa/tree/main/RIXA/Source/Actor) and their corresponding [Manager Classes](https://github.com/d7kh3ty/rixa/tree/main/RIXA/Source/Manager).
    
        See `Main.cpp` in the intial [**overhaul commit**](https://github.com/d7kh3ty/rixa/commit/879c57091c36d4994a33f6861b57da2eb35cfc4e)

2. **Folder Structure**
    - With the addition of more classes, I had to re-organise the file structure to make it more navigable.

        See [`RIXA/Source/`](https://github.com/d7kh3ty/rixa/tree/main/RIXA/Source)

### Bugs
1. **Crashing Issues**
    - Fixed illegal memory access crashes in the new implementation.
2. **Tracked Enemy**
    - Fixed a bug where the 'Tracked Enemy' would appear as a giant turret.

## Contributions
Thanks to the original team behind Rixa! It was a blast making this with them at the time. It was interesting to see how much I have improved over the monthes since then.

Here are the contributors to the base prototype:

**Daniel Vasile**
1. Sound

**Henry Ha**
1. Gameplay
2. Enemy, AI
3. Camera

**Izzy Cassell**
1. XML level loader
2. Level collisions
3. Enemy, AI

**Jake White**
1. Design
2. Assets
3. Music

## Related Posts