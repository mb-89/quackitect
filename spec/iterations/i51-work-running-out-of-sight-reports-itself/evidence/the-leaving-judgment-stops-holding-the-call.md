---
form: the-leaving-judgment-stops-holding-the-call
by: agent
signed_off: 2026-08-21T11:24:19.598Z
authors: agent
files:
---

# Evidence form / the-leaving-judgment-stops-holding-the-call

## current_situation

One await held the pull for as long as a step's leaving judgment ran. A state whose leaving check runs a battery froze the caller for ninety seconds.

THE CALL NOW ANSWERS INSIDE THE BOUND IT PROMISES. The judgment starts, the call waits at most one second, and it hands back whatever it has.

A FAST JUDGMENT IS STILL ONE CALL. Most leaving checks settle in milliseconds, so nothing about the ordinary walk changes — which is why a change to the walk's core broke nothing.

THE JUDGMENT ENTERS THE ONE TABLE against the step it belongs to. Without that state a settled verdict has nowhere to land.

## built

THREE FILES CHANGED.

`deliverable/engine/run.ts` — `openOperation` and `settleOperation`, the register-and-settle pair [[if-walk-engine-to-work-registry]] names. A judgment is started by the walk and runs as its own children, so it enters the table by name rather than by spawn.

`deliverable/engine/sessionscript.ts` — three new methods. `scriptStart` starts the judgment, registers it against its step, and hands the promise back unawaited. `scriptSettleWithin` waits at most the bound and answers either way. `scriptStanding` returns one word from the closed set of three.

`deliverable/engine/session.ts` — `assertConditions` calls `scriptSettleWithin(from.id, JUDGMENT_HANDBACK_MS)` where it used to `await this.scripts.scriptRun(from.id)`. The constant is 1000 ms, named and commented as the bound a lane call is promised.

MEASURED, 2026-08-21: THE WHOLE BATTERY IS GREEN. 1725 tests, 1725 pass, 0 fail. Biome checked 352 files with no fixes, preflight green, the sweep green over 2495 nodes.

BOTH HANDBACK REDS ARE CLOSED. `the serving path does not await a step's leaving judgment` and `a step's standing can be read while its judgment is still being reached` were written red at author-tests and are green now.

## follow_up

TWO CHUNKS REMAIN ON THIS STRAND.

`a-step-stands-in-one-of-three-words` gives every reader of green the third word distinctly. `scriptStanding` returns it already; what is owed is the readers taking it rather than flattening it.

`a-fresh-session-knows-a-deciding-step` closes [[raid-ar-walk-resumes-from-repo]], which is the fatal one.

THE ONE-SECOND BOUND IS A CHOICE WORTH REVISITING AT THE GATE. It keeps a fast judgment inside one call, which is why the blast radius was zero. A shorter bound would hand back more often and cost an extra call on every ordinary state.

## anything_else

THE ZERO BLAST RADIUS IS THE FINDING, and it came from following the design rather than the shortest path.

THE SHORTEST PATH WAS TO STOP AWAITING ENTIRELY. Every state with a leaving check would then refuse its first attempt and pass on a later pull, and every test asserting a single-call pass would have broken.

THE DESIGN SAID SOMETHING ELSE. [[raid-dec-a-long-step-acknowledges-first-and-reports-on-a-clock]] asks for an answer inside the bound, not for an answer that refuses to wait at all. Waiting up to the bound is what keeps a fast judgment in one call and a slow one from holding anybody.

SO THE ADR EARNED ITS PLACE. It was written at M5 as a decision about what a caller is told, and it turned out to be the difference between a change that broke nothing and a change that broke the suite.
