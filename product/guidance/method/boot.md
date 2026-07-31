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
- BOOT READS ONCE. The packet carries `reading`, naming `.se/reading.md`. Read that one file.
- It holds every document the way demands, and reading it credits them all.
- Do not split it into several calls. "Keep reads small" is about `offset`/`limit` inside a big file, never about how many documents ride in one envelope.
- Do not send `read_hashes` for what the reading credited. There is nothing left to prove.
- Page it with `offset`/`limit` only when a read is refused as oversize. Use generous limits: a document split across two pages is credited by neither.

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
