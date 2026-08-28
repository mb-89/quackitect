---
minted_in: i51-work-running-out-of-sight-reports-itself
id: opt-the-duration-is-computed-when-asked-not-when-started
type: "[[option]]"
statement: the time remaining is computed at the moment somebody asks for it, from what the work has done by then, rather than being decided when the work started and carried along unchanged
cluster: cluster-the-estimate
found_by: heuristic
source: the heuristic "push decisions to the last responsible moment", from meth-heuristics-catalog
---

## Mechanism

NOTHING ABOUT THE DURATION IS DECIDED WHEN THE WORK STARTS. The entry holds no
figure at all until a reader asks.

On the ask, the figure is computed from what the work has recorded about
itself by that moment, against what it has left.

## Why the heuristic bites here

THE DECISION IS BEING MADE AT THE EARLIEST POSSIBLE MOMENT TODAY, which is the
worst one. `batteryPace` reads the previous run's wall clock and phrases a
sentence when the job is handed off, at `deliverable/engine/tools-run.ts` line
483.

THAT SENTENCE THEN NEVER CHANGES. Asking a minute later returns the same
words, because they were decided before the work had done anything.

The last responsible moment for this decision is the ask. Every ask has
strictly more information than the start had.

## What it buys

THE FIGURE MOVES, which is what makes it worth reading twice.
`opt-the-estimate-may-rise-and-says-so` needs this: an estimate decided at the
start cannot rise, because nothing recomputes it.

AND THE NO-HISTORY CASE IMPROVES ON ITS OWN. A job with no previous run has
nothing to say at the start, and something to say a minute in. Deciding late
turns "cannot estimate, ever" into "cannot estimate yet".

## What it costs

The report does arithmetic on every ask rather than once. The probe measured a
status read at 1 ms, so the arithmetic has room.

A caller that asks in a tight loop pays that arithmetic repeatedly. That is
the polling this iteration exists to stop, so the cost falls on exactly the
behaviour we do not want.

## Where the same rule already holds here

The engine's own scope decision is made when a test is asked for, not when a
file changes. `decideScope` reads what has changed at the moment of the call.

So this is the house rule applied to a place that missed it, rather than a new
idea.
