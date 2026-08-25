---
form: blockers-only-stop
by: agent
signed_off: 2026-08-24T16:27:58.658Z
authors: agent
files:
---

# Evidence form / blockers-only-stop

## current_situation

A one-time stop bypass was evaluated before the latest pull. Under blockers-only, that could end a turn after the walk had resumed successfully.

## built

Updated `deliverable/engine/bin/se-hook-stop.ts` so the bypass applies to blockers-only only when the latest pull remains refused. Extended `deliverable/tests/stophook.test.ts` with a blocked-then-runnable sequence.

## follow_up

The engine-owned focused validation is running. Repair the base specify-build form so it authors chunk drawings without a manual file patch; then add zero-worker automated coverage.

## anything_else

