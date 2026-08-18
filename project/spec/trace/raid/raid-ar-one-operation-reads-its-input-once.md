---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-ar-one-operation-reads-its-input-once
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-one-operation-reads-its-input-once at risk — the response hinges on el-walk-engine.
owner: the adjudicator
trigger: any new corpus reader added to the pull's machinery, or an ask counter placed at the dispatch boundary and answering more than one
status: open
impact: the measure is enforced for exactly one operation, and twenty-three corpus load sites stand outside that guard with nothing counting asks per lane call
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-one-operation-reads-its-input-once
  - el-walk-engine
  - tsp-one-operation-reads-its-input-once
---

## The guard exists and covers one operation

`tests/drift.test.ts` LINES 617 TO 620 ASSERT `asks === 1` for `recordDone`. The
meter counts the right thing: `engine/trace.ts` line 553 says one operation, one
ask, and twenty-five asks means twenty-five states each fetching their own.

THE REQUIREMENT BINDS EVERY OPERATION. Its own line 5 says "for every operation
that serves a call", and line 28 says the number of parses per operation is one,
whatever the number of parts.

## The gap is named in the corpus rather than discovered here

`tsp-one-operation-reads-its-input-once` LINE 44 SAYS IT OUTRIGHT: what this
does not yet cover is the asks made across a whole lane call, as opposed to
within one green walk.

THE UNGUARDED SURFACE IS TWENTY-THREE CALL SITES across six engine files,
eighteen of them in `stateform.ts` and `session.ts` — the pull's own machinery.

## Why no existing check can see it

A CACHE HIDES IT FROM THE OLDER GUARD. `engine/trace.ts` lines 548 to 551 record
that `loadTrace` memoizes above the door, so a per-state corpus load costs about
210 `statSync` calls the door never sees. The door count stayed flat and the
guard passed.

SO ONLY THE ASK COUNTER CAN SEE THIS DEFECT, and the ask counter is not placed
at the dispatch boundary.

## The tradeoff

THE MEMO BUYS BACK 312.9 ms TO 4.3 ms PER ASK and keeps the product usable while
the shape is unfixed. The price is that ask count is invisible to latency and to
the door meter, so any operation other than `recordDone` can regress to per-part
fetching with nothing going red.

## What would make it fire

ONE `se_pull` THAT BUILDS A FORM AND COMPUTES GREEN. A second, third and tenth
ask inside that one call passes every test in the tree.

## The fix is small and is not this state's

WRAP A WHOLE LANE CALL AND ASSERT THE `corpusAsks()` DELTA IS ONE — the same
counter the green-walk case already uses, moved up to the dispatch boundary. It
counts asks rather than milliseconds, which is what makes it a fair check.
