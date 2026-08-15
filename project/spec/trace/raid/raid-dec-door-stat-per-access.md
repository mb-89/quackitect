---
minted_in: i1
id: raid-dec-door-stat-per-access
type: "[[raid]]"
kind: decision
statement: The correctness store checks freshness by stat on every access — the clock only denies caching, and no watcher stands between a read and the disk.
owner: the maintainer
trigger: a measured stat cost above the walk's patience, or a stale read observed through the door
status: decided
impact: Wrong, reads serve stale bytes and every check downstream judges a world that moved.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - req-trace-view-derived-from-files
  - raid-dec-thin-tree
---

Settled 2026-08-09 against the watcher-backed hot model the owner raised
(VS Code and Obsidian both ride a watcher). The answer that held: both
apps pair the watcher with re-stat on focus, and neither promises a
correctness read — the door does. The vault stays the hot RENDER model;
the door stays the truth.

The same-tick hole is closed by the provisional stamp: a stamp minted
inside its own file-time tick is never trusted for caching.

## Rejected options

- the watcher-backed hot model as the one store — a missed event serves
  stale truth with no tell.
- a byte-cache with TTL — a clock DECIDING freshness, which the house
  rules out; the clock may only deny.

## Consequences

- Every read through the door costs one stat; the vault serves the hot
  renders.
- The provisional-stamp rule stays load-bearing on Windows's coarse
  file-time tick.
