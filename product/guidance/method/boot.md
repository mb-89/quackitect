---
id: boot-method
tags: boot
statement: How to run boot reliably across hosts and avoid avoidable refusals.
---

# Boot method

Boot exists to reach idle fast and clean.

## Startup order

- First call is `se_tick` with no arguments.
- Immediately activate file and search lane tools.
- Then follow the machine one state at a time.

## Stability pattern

- Keep boot calls serial.
- Avoid parallel search and read batches in boot.
- Keep reads small with `offset` and `limit`.
- Cache read hashes by path for this session.
- Reuse cached hashes in `read_hashes` on later ticks.
- Read every path in `pulled` and `lookahead_read` as soon as it first appears.
- If a target is set, call `se_tick {route: "<target>"}` and read every path in its `reads` list before advancing.

## Re-read rules

- Read a path once when it first appears.
- Re-read only when a refusal names missing or stale hashes.
- Re-read after compaction when the state says reading proof is fresh per tick.

## Refusal-safe walk

- If a state allows no tools, do not read or search there.
- Tick and let the state scripts run.
- On refusal, follow the typed remedy in one turn.

## Goal

- Reach idle without avoidable rejections.
- Keep output small and deterministic so host cancellation is less likely.
