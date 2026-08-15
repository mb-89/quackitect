---
form: fanout-cap
by: agent
signed_off: 2026-08-15T11:18:01.046Z
authors: agent
files:
---

# Evidence form / fanout-cap

## current_situation

The test runner forks one worker per file up to the machine's core count, and nothing capped it. On a sixteen-core machine a run took all sixteen, and the engine is one process on those same cores.

So the lane stopped answering while a run was in flight. One call died mid-battery this session and the next three answered normally, which is starvation rather than a crash.

## built

Committed in 0c6babef.

- engine/testreporters.ts gains testConcurrency(cores), returning cores minus one and never less than one.
- engine/tools.ts passes --test-concurrency on the scoped run, sized from availableParallelism() at call time.
- engine/bin/selftest.ts passes the same on the battery.

THE NUMBER IS READ, NEVER WRITTEN. The owner's objection on 2026-08-15 was to a count being fixed in a design rather than to any particular value, and note-5fc54baed71c carries it. This reads the machine every run, so a sixteen-core box and a two-core container each get their own answer.

Covered by tests/timings.test.ts: the cap leaves a core at 16 and at 2, and never asks for fewer than one worker at 1 or at 0.

## follow_up

- WHAT THIS BUYS IS NOT SPEED. It will make the battery slightly slower, because one fewer worker runs. What it buys is a lane that answers while the battery runs, and the record's own ruling is that speed is never bought from the guard.
- The before-and-after is not measurable yet. Comparing wall clocks needs the timing instrument, which is repaired in this same record but not yet live in the running engine.
- The heavy-slot lease from i27 is the other half of this question and is NOT this record's. It rations the right to be expensive; this caps what already forks.

## anything_else

ON CAPPING RATHER THAN POOLING.

The obvious reading of this chunk is that it builds a small worker pool. It does not, and the difference matters because i27 already ruled on it.

A pool holds processes ready and hands work to whichever is free. This changes ONE ARGUMENT on a spawn that was already forking workers, so that it forks one fewer.

i27's build plan says plainly under what is deliberately not there: no worker pool, and the heavy-slot lease rides in core-process instead, on the owner's ruling of 2026-08-14.

So the cap is the smallest thing that stops a run taking every core, and it leaves that ruling untouched.
