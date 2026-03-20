# Asciiroids

A p5.js microgame inspired by the original Asteroids arcade game, rendered entirely in ASCII art. Entities are drawn as monospace text glyphs on a canvas, giving the game a retro terminal aesthetic.

## Tech Stack

- **p5.js v1.9.0** — graphics, input, and game loop
- **Vite v5** — dev server and bundler
- **Vanilla ES modules** — no framework

```
npm run dev    # start dev server
npm run build  # production build
```

## Architecture

Seven focused ES module classes. `Game.js` is the central orchestrator; all other classes are self-contained entities.

```
src/
  main.js       — p5.js sketch setup; creates Game instance
  Game.js       — state machine, collision detection, spawning, scoring
  Ship.js       — player ship: movement, thrust, firing
  Asteroid.js   — asteroids: sizing, splitting, ASCII art variants
  Bullet.js     — projectiles
  Explosion.js  — particle burst effects
  utils.js      — ASCII art parser, screen-wrap helper
```

## Game States

`START → PLAYING → DEAD → GAME_OVER → START`

- **START** — title screen with high score
- **PLAYING** — active gameplay
- **DEAD** — brief respawn delay (2000ms) after losing a life
- **GAME_OVER** — final score screen

## Core Mechanics

**Ship**
- Rotate: left/right arrows; Thrust: up arrow; Fire: space
- Max 4 active bullets at a time
- Max speed 8 units; thrust acceleration 0.22/frame
- 3-second invincibility + blink on spawn

**Asteroids**
- 3 sizes (large/medium/small), radius 32/18/10 px
- Hit a large → splits into 2 medium; medium → 2 small; small → destroyed
- 2–3 ASCII art variants per size, randomly selected and continuously rotating
- Speed scaling: `basespeed * (1 + (level-1) * 0.12)`

**Scoring** — size 3: 20 pts, size 2: 50 pts, size 1: 100 pts
**High score** — persisted in `localStorage` key `asciiroids_hi`

**Wave progression** — each wave spawns `2 + level` asteroids with increasing speed

## Rendering

- Canvas: 900×650 px, black background, orange `rgb(255, 176, 0)` palette
- Font: Courier New 14pt monospace; character cell: 10×14 px
- `parseAsciiArt()` in `utils.js` converts multiline string templates into glyph arrays `{char, x, y}` for efficient draw calls
- CRT scanline overlay applied via CSS on the canvas element

## Physics Conventions

- All physics uses **delta-time normalization**: `dtN = dt / 16.67` (targets 60 FPS)
- `wrapPos(x, y, w, h)` in `utils.js` handles modulo screen-edge wrapping for all entities
- Collision detection: circle–circle distance checks only

## Adding Content

**New asteroid variant** — add an ASCII art string to the `VARIANTS` array in `Asteroid.js` for the appropriate size bucket; `parseAsciiArt()` handles the rest.

**New entity type** — implement `update(dt)` and `draw(p)` methods, store in a `Game.js` array, filter dead instances in `Game.update()`, and add circle-collision checks as needed.
