# measurements — pong embed budget

Measured 2026-07-12 on the finished spike artifact.

## Sizes

- pong.html total: **3,877 bytes** (3.8 KB)
- game-only script block: 3,205 bytes
- game-only style block: 451 bytes
- game-only portion (script + css): **3,656 bytes** (3.6 KB)
- real book (spec/book.html, read-only): 3,629,975 bytes (3.46 MB)

## Ratios

- game-only vs the real book: **0.10 %**
- game-only vs the 50 KB sanity budget: **7.3 %** of the budget

## Embed verdict

- The game fits the embed budget with a wide margin.
- The lazy-init structure is already in place. Nothing runs before the Start click:
  - no canvas access
  - no key listeners
  - no animation loop
- The embed can reuse the `startPong()` function body as-is.

## Screenshots (run proof)

- [shot-start.png](shot-start.png) — the start screen. Title, one instruction line, a Start button. No canvas yet (lazy-init proof).
- [shot-playing.png](shot-playing.png) — after an injected auto-start plus 3 s of virtual time. Court, dashed center line, both paddles, 0–0 score, ball displaced from center (the loop ran).
