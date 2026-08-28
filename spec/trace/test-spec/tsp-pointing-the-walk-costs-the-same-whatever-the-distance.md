---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: tsp-pointing-the-walk-costs-the-same-whatever-the-distance
type: "[[test-spec]]"
statement: A bare aim answers in a time that does not grow with the distance to its target.
method: test
verifies:
  - req-aiming-returns-before-the-walking-starts
files:
  - deliverable/tests/clear-jump.test.ts
---

## Steps

1. Aim at a reachable target without asking to go.
2. Assert the walk stands exactly where it stood — nothing was swept.
3. Assert the answer reports that a direction was taken, and does NOT report
   arrival.
4. Assert the answer says whether the target is reachable.
5. Assert the answer reports how many states the search looked at, and that the
   figure is at least the number of hops it found.

## The oracle

THE WALKING IS WHAT MUST NOT HAPPEN, and steps 2 and 3 are the oracle. The
requirement is that aiming returns before the walking starts, so an aim that
swept anything has failed it whatever the clock says.

### This row asked for medians, and the measurement took them away

THE EARLIER FORM compared a near aim against a far one over ten runs each, on
the reasoning that drawing the route is the cost that grows with distance.

THE REASONING WAS MEASURED AND IT IS FALSE. Building a session costs 33 ms. One
expand costs 3.7 ms cold and 0.1 ms warm. A whole route of six hops costs 68 ms.
The walking that this row exists to forbid costs seconds.

SO A MEDIAN COMPARISON HERE MEASURES THE MACHINE. Two millisecond-scale numbers
differ by more between one run and the next than the defect would move them, and
a test that fails on a busy laptop teaches its reader to rerun rather than to
look.

WHAT REPLACED IT IS COUNTABLE AND EXACT. The search expands each state at most
once and says how many it looked at. That is the property distance cannot
change, asserted with no clock in it.

### The drawing stays, and step 4 is why

ONLY THE DRAWING CAN SAY WHETHER THE TARGET IS REACHABLE. A form that skipped it
stored a direction it could not vouch for and pushed the refusal one call later,
which is the opposite of what
[[req-a-target-that-cannot-be-reached-is-refused-quickly]] asks for.

## What would make this test lie

ASSERTING THAT THE COUNTS WERE REPORTED RATHER THAN WHAT THEY SAY. A figure of
the right type proves nothing; the bound against the hops found is the claim.

## What this does NOT verify

THE COMBINED FORM. Asking to aim AND go in one call is a different act with its
own standing row, and this spec says nothing about how long that may take.

## Why this file and not another

THE COMBINED FORM ALREADY HAS A HOME HERE, and that file is named for it. The
bare aim is the same verb with its flag the other way, so its cases belong
beside the ones that already exercise the jump rather than in a general routing
file.

THAT ALSO PUTS THE TWO ROWS SIDE BY SIDE where a reader can see they are
different acts. The pair was mistaken for a contradiction once already.
