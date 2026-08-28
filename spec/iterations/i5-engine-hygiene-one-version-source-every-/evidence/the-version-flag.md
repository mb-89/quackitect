---
form: the-version-flag
by: agent
signed_off: 2026-08-19T12:03:53.714Z
authors: agent
files: null
---

# Evidence form / the-version-flag

## current_situation

The first chunk. Nothing else in the plan has been touched.

The flag was the one item in this record with an owner ruling behind it and no code at all: i16 found it missing by asking for it and starting a server instead.

## built

`project/deliverable/engine/bin/se-mcp.ts` — a `--version` branch, six lines, placed BEFORE the `--help` branch and before the root is resolved. It prints `SE_VERSION` and exits 0. `--help` now lists it.

THE ORDER IS THE DESIGN, not an accident of where the lines went. A package is asked what it is on a machine where nothing is configured, so a check needing a valid root would fail for a reason that has nothing to do with the question.

OBSERVED, not reasoned:

- `node engine/bin/se-mcp.ts --version` → exit 0, stdout `5.0.0`, stderr empty.
- The same with `--root /no/such/place` → exit 0, stdout `5.0.0`. The root is never reached, which is the claim the placement makes.

`SE_VERSION` was already imported in that file and already reads the manifest. Nothing new resolves a version, so there is no second place for a stamp to drift.

## follow_up

The next chunk is `an-empty-source-says-so`, in `stateform.ts`. It shares no file with anything built here.

THE FOUR CASES OF tsp-an-install-answers-what-it-is should now be green. The scoped run for this chunk was handed off as a background job before the observation above; its verdict records itself, and verification is where the whole battery answers.

## anything_else

THE SCOPED RUN CAME BACK AS A BATTERY. Asked for a run against this change, the engine answered that no earlier battery is on record to size the wait, and handed off the whole suite. That is correct behaviour on a fresh container — the record it would size against does not survive a container — and it is the same gap the timings issue on the register already names.

SO THE EVIDENCE ABOVE IS A DIRECT OBSERVATION rather than a test verdict. Two commands, their exit codes and their exact output. The cases that encode the same claims are in `tests/version-flag.test.ts` and the battery answers for them.
