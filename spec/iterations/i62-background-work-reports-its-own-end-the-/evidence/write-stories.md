---
form: write-stories
by: agent
signed_off: 2026-08-24T15:58:54.831Z
authors: agent
files: null
---

# Evidence form / write-stories

## current_situation

The vision is axiom and the delta extends vp-autonomy-range with two new pass lines.

Three stories are written for the delta. The resident stories stand untouched, and none of the three rewrites one.

Each deck's evidence half is empty, which is correct before M8. The left halves of the problem and starting-state slides carry real references into the engine, because those claims are checkable today.

## stories

- sty-the-run-that-died-while-nobody-was-holding-it
- sty-the-wait-that-says-how-long-it-will-wait
- sty-the-second-engine-that-refuses-to-start

## follow_up

The next state generalises these into use cases.

One finding from writing them belongs downstream by name. Two partial fixes already stand in the engine and neither covers the measured fault: deliverable/engine/run.ts line 1090 lets a settled record beat a running one but only for test operations, and line 1490 reaps ghosts only at startup. The requirements have to say what the live path does, not repeat what the startup path already does.

## anything_else

WHICH ARE MUSTS, AND WHY EACH EARNS ITS DEMONSTRATION.

sty-the-run-that-died-while-nobody-was-holding-it is a MUST. It is the measured fault told as a pass, and the record exists for it.

sty-the-wait-that-says-how-long-it-will-wait is a MUST. A bounded wait is the difference between a walk that stalls and a walk that reports why it stopped, and on an unattended box that is the whole run.

sty-the-second-engine-that-refuses-to-start is a SHOULD, deliberately. It is real and it was observed, but the record's own reaping code already assumes one engine per port, so this story makes an existing assumption true rather than adding a capability. The other two fail visibly without it and it does not fail visibly without them.

WHAT WRITING THEM CHANGED. The first story would not tell without naming what the engine does today, and naming that turned up two partial fixes nobody had connected. That is the design instrument working: the hole was found by trying to tell the story rather than by reviewing the design.
