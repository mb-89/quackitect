---
form: state-entry-form
by: agent
signed_off: 2026-08-24T16:22:31.263Z
authors: agent
files: null
---

# Evidence form / state-entry-form

## current_situation

The successful sweep could return `do` after entering a state that already owed its form. `pullAfterSweep` now checks `pullFormsOwed()` before returning a continuation response.

## built

Updated `deliverable/engine/session.ts` to return `fill` with the entered state's form after a successful sweep. Added a regression in `deliverable/tests/pull.test.ts`.

## follow_up

Run the engine-selected test scope once this state permits it. Then repair the first-class chunk-authoring path, session guidance filtering, blockers-only continuation, and zero-worker regression.

## anything_else

