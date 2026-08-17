---
form: one-read-per-operation
by: agent
signed_off: 2026-08-17T13:39:09.250Z
authors: agent
files:
---

# Evidence form / one-read-per-operation

## current_situation

This chunk is BUILT for the green walk and MEASURED, and its full reach waits on the boundary model.

It exists because req-one-operation-reads-its-input-once was written on the redo. The rule itself is not new — it has been guidance in software.md since 2026-08-09 and notes.ts argues it in a comment. Guidance is not checkable, and that is what changed.

## built

ONE OPERATION READS ITS INPUT ONCE, and the meter says so rather than a stopwatch.

WHAT LANDED:

- engine/session.ts: blessedGates takes the caller's already-computed paint set. render.ts computes recordPaint one line above the call, so the bless check would otherwise have run a SECOND full green pass over the same corpus inside one render. That is the exact shape this iteration exists to remove, introduced by my own fix an hour earlier and caught by reading the call site rather than by a test.
- engine/render.ts: the call site passes it.
- tests/drift.test.ts: the case that holds the property.

THE MEASUREMENT IS doorStats() IN engine/notes.ts — entries held, served from held, read from disk. The test asserts a SHAPE and not a tuned number: a second recordDone inside one GreenPass costs zero further asks at the door, with the first asserted non-zero so a test that reads nothing cannot pass by accident.

WHY NOT A LATENCY BUDGET. Stamping the corpus took one ask from 312.9 ms to 4.3 ms — seventy-fold on the wrong number. Any budget written before that change would have gone green afterwards while the sixty-six asks per record entry stayed exactly where they were. notes.ts says it in its own words: a cache cannot fix a call count.

VERIFIED: 1399 tests, 0 failures.

WHAT IS NOT YET COVERED, named rather than left blank. The row says every operation that serves a call, and this proves it for the green walk alone. Counting asks across a whole lane call needs a list of operations to count against, and that list is model-the-boundaries.

## follow_up

THE BROADER HALF WAITS ON model-the-boundaries, and that is the forced order the scope named rather than a delay.

Until the interfaces are nodes there is no denominator: no way to say which operations serve a call, and so no way to assert that each of them reads its input once.

## anything_else

