# AGENTS.md - Project Intelligence

## Overview
- **Project Name:** Playable Runner
- **Tech Stack:** Pixi.js v8, TypeScript, Vite.
- **Goal:** A 2D runner game where a player (girl) avoids enemies (thief) and obstacles (bushes) while collecting dollars/coins.
- **Design Resolution:** 720x1280 (Portrait).

## Architecture
- `src/main.ts`: Application entry point.
- `src/Game.ts`: Core game loop, state management (`GameState`), and collision logic.
- `src/Player.ts`: Player character logic, animations (run, jump, hurt), and hitbox.
- `src/Level.ts`: Dynamic entity spawning, movement, and level progression based on distance.
- `src/Background.ts`: Tiling backgrounds and parallax-like movement.
- `src/HUD.ts`: Score (money) and life tracking UI.
- `src/utils/constants.ts`: Global configuration (speeds, ratios, entity types, level data).
- `src/utils/assets.ts`: Asset loader and spritesheet manager.

## Key Constants
- `PLAYER_GROUND_Y_RATIO = 0.78125` (corresponds to 1000px height).
- `BASE_SPEED = 600 px/s`.
- `JUMP_DURATION = 800 ms`.
- `MAX_LIVES = 3`.
- `INVINCIBILITY_DURATION = 500 ms`.

## Gameplay Mechanics
- **Player Hitbox:** Scale `{X: 0.25, Y: 0.7}`, Offset `{X: 0, Y: -0.15}`.
- **Enemy Hitbox:** Scale `{X: 0.3, Y: 0.5}`, Offset `{X: 0, Y: 0.2}`.
- **Damage Logic:** -1 life and 500ms invincibility with Red/White tint blinking.
- **Obstacles:** Check collisions even in jump; penalty is HP loss, not instant death.
- **Finish Line:** Triggered when `currentDistance >= totalDistance`.

## Asset Pipeline
- Spritesheets for `runner` and `thief`.
- Static textures for backgrounds, decorations, and UI elements.
- `coinGlow` texture used for pulsating visuals on interactable objects.

## Contextual Notes for Agents
- **Ref Synchronization:** The project is strictly aligned with reference parameters from `COMPARISON.md`.
- **Styling:** Vanilla Pixi.js (no external physics engine).
- **Coordinate System:** Anchor (0.5, 1) for ground-based entities; (0.5, 0.5) for collectibles.
