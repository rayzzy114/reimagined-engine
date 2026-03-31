# Changelog: Synchronizing with Reference

Based on the analysis in `COMPARISON.md`, the following changes have been implemented to align the project with the reference game parameters.

## World & Physics
- **Ground Y:** Updated from `0.72` to `0.78125` (1000px on a 1280px height design).
- **Spawn X:** Entity spawn position shifted from `820px` to `1080px`.
- **Enemy Chase Speed:** Increased additional chase speed to full `300 px/s` (was scaled down by 0.3).

## Player (Girl)
- **Animation Speeds:**
    - Run: `0.15` (from 0.2)
    - Jump: `0.225` (from 0.15)
    - Hurt: `0.30` (from 0.15)
- **Hitbox:** Implemented reference scale `{X: 0.25, Y: 0.7}` and offset `{X: 0, Y: -0.15}` relative to sprite center.
- **Visuals:** Replaced alpha-based blinking with tint-based blinking (Red/White) during invincibility.

## Entities
- **Enemy (Thief) Hitbox:** Implemented reference scale `{X: 0.3, Y: 0.5}` and offset `{X: 0, Y: 0.2}`.
- **Collectible (Dollar):** Scale reduced from `0.35` to `0.15`.
- **Glow Effects:** Added pulsating `coinGlow` to both collectibles and obstacles.

## Gameplay Logic
- **Obstacle Collisions:**
    - Now checked even when the player is jumping.
    - Collision now results in `-1 HP` and temporary invincibility instead of instant game over.
- **Hurt Animation:** Properly triggers on both enemy and obstacle hits.

## Files Modified
- `src/utils/constants.ts`
- `src/Player.ts`
- `src/Level.ts`
- `src/Game.ts`
