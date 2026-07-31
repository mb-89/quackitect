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
- Keep reads small with `offset` and `limit`.
- Cache read hashes by path for this session.
- Reuse cached hashes in `read_hashes` on later ticks.
- The packet carries `route_reads` whenever a target is set. It lists every document the way there demands.
- Read that whole list in ONE `se_file_read`. That is the only reading call boot needs.
- You do not have to ask for it. You do not have to know any route syntax.
- Keep the hashes. Send them in `read_hashes` on every tick.
- With no target set, read `pulled` and `lookahead_read` as each path first appears.

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
