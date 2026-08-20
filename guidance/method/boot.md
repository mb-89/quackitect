---
id: boot-method
tags: boot
statement: How to run boot reliably across hosts and avoid avoidable refusals.
---

# Boot method

Boot exists to reach idle fast and clean.

## Startup order

- First call is `se_pull` with no payload.
- Immediately make the file and search lane callable. How depends on the host — workspace/AGENTS.md says which way per host.
- Then do what each pull answers, and pull again.

## Stability pattern

- Keep boot calls serial.
- Avoid parallel search and read batches in boot.
- BOOT IS ONE INSTRUCTION, REPEATED. The pull answers `read` and carries the document, so read it and pull again with `form: {"read": "<its last words>"}`.
  - Keep pulling. The machine walks boot itself and lands you at the target.
- Each reading call carries one document and credits it. Boot's reading is a handful of calls, and none of them can be truncated.
- Do not read the guidance files yourself. The loop knows what you owe.
- There are no hashes to carry, ever. The reading is the proof.

## After a compaction

- What you remember reading is gone from your head, and the machine knows.
- Pull. It answers `read` for whatever must be read again.

## Refusal-safe walk

- If a state allows no tools, do not read or search there.
- Pull, and let the state scripts run.
- On refusal, follow the typed remedy in one turn.

## Goal

- Reach idle without avoidable rejections.
- Keep output small and deterministic so host cancellation is less likely.
