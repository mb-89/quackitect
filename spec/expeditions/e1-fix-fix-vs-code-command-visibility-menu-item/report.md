---
files: []
status: done
---

## What was the goal

Fix VS Code command visibility so menu items (Start the agent, and the others in the tools strip) never appear before the extension can actually run them, matching how the dynamic cards (State machine, Trace graph, The book, Log, Database) already stay hidden until fetched from the engine.

## What was done

Found that deliverable/vscode/src/extension.ts already hides the dynamic cards correctly: `cards` starts as an empty array, and Strip.tools() only lists a card once `refreshCards()` has fetched it from the running engine's /api/cards. The static rows (What this is, Start the agent, Create a vehicle, Create a project) had no such gate and always rendered from activation, including during the window before `ensureServer()` (auto-called in `activate()`) resolves. Clicking Start the agent in that window is what triggers `confirmLaneIsReachable()`'s warning dialog, since that very click is what spawns the engine.

Added a `toolsReady` flag (default false). `Strip.tools()` returns an empty list until it flips. `activate()`'s `ensureServer().then(...)` now sets `toolsReady = true` and calls `strip.render()` unconditionally (success or failure), before going on to fetch cards and start polling on success. The whole tools strip now appears together, once, only after the first readiness probe answers — the same shape the cards already had.

Ran `npm run build` (esbuild regenerates vscode/extension.js from src/extension.ts, exit 0) and `npx biome check vscode/src/extension.ts` (clean, no fixes needed).

## What settled it

Read src/extension.ts end to end around Strip, cards, activate() and startAgent()/confirmLaneIsReachable() to confirm the existing cards-hiding mechanism and the exact race the warning dialog comes from. Verified with a real build (esbuild, exit 0, extension.js regenerated) and biome check (clean) rather than assuming the edit compiles.

## What was not done

Did not change the confirmLaneIsReachable() warning itself, and did not add a loading placeholder/spinner in the strip while toolsReady is false — the strip is simply empty during that window, same as the cards area was already. Did not add an automated test for the webview strip; there is no existing test harness for the webview HTML in this repo to extend. Did not touch extension.js by hand — it is generated.

## Files

None.
