---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: tsp-fallback-outcome
type: "[[test-spec]]"
statement: A failed completion fires the fallback edge and not the forward one, and leaves the state out of the green set — while a filled completion does the opposite.
method: "test"
verifies:
  - "req-a-fallback-fires-when-its-condition-fails"
files:
  - "tests/fallback-outcome.test.ts"
---

## Scope

`completeState` and `settledStates`, over a machine whose only interesting
property is having both a forward edge and a fallback.

## Approach

UNIT LEVEL, OVER A HAND-BUILT MACHINE. The demand is two lines of edge
arithmetic. A booted session would need a red exit script, a bound record
and a pinned column to say the same thing, and would prove less.

BOTH DIRECTIONS, BECAUSE ONE ALONE IS VACUOUS. A case showing that a
failed completion is not green proves nothing unless a filled completion
IS green in the same fixture — otherwise it would pass against a
`settledStates` that always returned empty.

## Steps

Every case in the referenced file is one step; the case name states its
claim.

- A FILLED COMPLETION TAKES THE FORWARD EDGE AND NOT THE FALLBACK. The
  repair door stays shut on a good run.
- A FAILED COMPLETION OPENS THE FALLBACK. That is what makes the drawn
  repair path reachable at all, and it never was before.
- AND THE FORWARD EDGE DOES NOT FIRE on a failure. A red run may not walk
  on to the gate.
- THE STATE THAT TOOK THE FALLBACK READS RED. The owner's own condition
  on the fix, and the thing that stops a walk laundering a red into a
  signed claim.
- THE SAME STATE COMPLETING FILLED READS GREEN, which is what makes the
  case above mean something.

## What is deliberately not here

WHICH CONDITIONS EXEMPT A FALLBACK. `assertConditions` already exempts an
edge the drawing marks fallback or error from the exit condition it
answers, and that seam has its own cases.

THE WALK'S END-TO-END BEHAVIOUR at verification. That needs a red battery
on demand, which means committing a broken check, and the battery would
then have to tolerate it forever.

## The measurement behind the row

2026-08-16, at i6's own verification: the battery went red, fix-findings
was listed as an open option, and every attempt to take it refused. The
walk stood in a state granting read verbs only, with no legal move
forward and none back.
