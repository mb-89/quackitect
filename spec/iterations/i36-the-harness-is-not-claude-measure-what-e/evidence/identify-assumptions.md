---
form: identify-assumptions
by: agent
signed_off: 2026-08-19T10:48:23.271Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

The function structure is derived and closed both ways. This sweep walks the seven requirements per assumption-hunting source and writes down what each leans on without yet checking it.

## assumptions

- raid-asm-documented-harness-limits-stay-stable
- raid-asm-unflagged-typescript-execution-is-universal
- raid-asm-a-cancelled-call-is-a-request-abort-not-a-crash
- raid-asm-the-stop-hook-fires-the-same-on-posix
- raid-asm-the-harness-scan-still-matches-current-releases
- raid-asm-an-engineer-can-tell-stop-hook-from-cancellation-today

## sweep

- environment: the measured per-harness size limits are treated as stable across releases — raid-asm-documented-harness-limits-stay-stable.
- toolchain: every supported harness is treated as spawning engine scripts under unflagged Node/TypeScript execution — raid-asm-unflagged-typescript-execution-is-universal.
- host: a cancelled call is treated as a request abort rather than a server crash — raid-asm-a-cancelled-call-is-a-request-abort-not-a-crash. This is a live finding from today's session: an owner-reported ECONNRESET immediately following a cancelled se_pull call, resolved by checking the mirror's process and HTTP health directly rather than by inference.
- platform: the stop hook is treated as firing the same on POSIX as measured on Windows — raid-asm-the-stop-hook-fires-the-same-on-posix.
- neighbours: the 2026-08-18 harness research scan is treated as still matching each vendor's current release — raid-asm-the-harness-scan-still-matches-current-releases.
- people: an engineer is treated as able to tell a stop-hook block from a plain cancellation using chat context alone, with no named interruption report — raid-asm-an-engineer-can-tell-stop-hook-from-cancellation-today.

## follow_up

Probe every standing assumption, these six included, at the next state.

## anything_else

