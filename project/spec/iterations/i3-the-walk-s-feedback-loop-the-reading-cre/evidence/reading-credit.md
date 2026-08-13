---
form: reading-credit
by: agent
signed_off: 2026-08-13T12:13:12.618Z
authors: agent
files:
---

# Evidence form / reading-credit

## current_situation

The reading credit lived in memory only. Every engine reload re-owed the whole reading list, and the 2026-08-11 retro called it the day's entire toll.

## built

session.ts, three pieces.

- `persistSettings` writes `reads` (path to content hash) and `reads_pid` (the process that earned them) into .se/settings.json. Called from rememberRead, creditReading, takeReadProof and clearReadBuffer, so the store never lags the buffer.
- `restoreReadCredit(reads, pid)` puts them back on construction, and ONLY when the stored pid differs from this process. Same process means the buffer is already in memory; a different one means a reload.
- `restoreSettings()` was split out of the constructor to stay under the complexity ceiling.

THE PID IS THE WHOLE DESIGN. A reload replaces the process and keeps the tree, so "different process, same session" is exactly a reload. Without the discriminator a second Session in ONE process would inherit credit it never earned, which is what req-compaction-reowes-the-reading forbids. reads.test.ts pins that case and stayed green.

VERIFIED LIVE, not only by test: the first boot after this landed came up with nothing owed, for the first time in the project.

Cases: tests/feedback-loop.test.ts — the credit survives a reload, and a document whose content moved is owed again.

## follow_up

Nothing owed. The credit is keyed to content, so a moved store does not invalidate it and a changed document is honestly re-owed.

## anything_else

