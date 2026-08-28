---
form: observe-red
reopened: 2026-08-24T15:52:32.024Z — The re-signed build specification invalidated this earlier checkpoint, so it must re-earn its red observation.
judgment: passed at 2026-08-24T15:48:52.830Z
by: agent
signed_off: 2026-08-24T16:14:25.554Z
authors: agent
files: null
---

# Evidence form / observe-red

## current_situation

The new post-sweep regression expects an entered state's required form in the same successful pull. The current response falls through to `do`, so the new assertion should fail before the source repair.

## red_observed

- [x] No non-test specifications require a manual red observation.

## follow_up

Repair Session.pullAfterSweep to return an owed form before it constructs the successful `do` response. Re-run the engine-owned checks after the repair.

## anything_else

