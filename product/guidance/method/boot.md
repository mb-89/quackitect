---
id: boot-method
tags: boot
statement: How to run boot reliably across hosts and avoid avoidable refusals.
---

# Boot method

Boot exists to reach idle fast and clean.

## Startup order

- First call is `se_tick` with no arguments.
- Immediately make the file and search lane callable. How depends on the host — workspace/AGENTS.md says which way per host.
- Then follow the machine one state at a time.

## Stability pattern

- Keep boot calls serial.
- Avoid parallel search and read batches in boot.
- BOOT PULLS THE READING. Call `se_reading`, read what it hands back, call it again. Stop when it answers `done: true`.
- Each call carries one document and credits it. Boot's reading is a handful of calls, and none of them can be truncated.
- Do not read the guidance files yourself. The loop knows what you owe.
- Do not send `read_hashes` for what the loop credited. There is nothing left to prove.

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
