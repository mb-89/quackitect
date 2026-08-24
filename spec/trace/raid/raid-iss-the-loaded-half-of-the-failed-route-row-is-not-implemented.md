---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: raid-iss-the-loaded-half-of-the-failed-route-row-is-not-implemented
type: "[[raid]]"
kind: issue
statement: "The spec that says a failed route answers no slower than a drawn one carries a step that runs both cases under load, and only the quiet case is implemented."
owner: the driving agent
trigger: it has happened, and a tester with fresh eyes found it at verification
status: open
impact: "The quiet case is the control and the loaded case is the actual condition. With only the control implemented, the row goes green while saying nothing about the situation it was written for."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - req-a-target-that-cannot-be-reached-is-refused-quickly
  - tsp-a-failed-route-answers-no-slower-than-a-drawn-one
  - raid-iss-the-surface-row-has-no-harness-that-could-fail-it
---

## What is implemented and what is not

THE QUIET CASE IS IMPLEMENTED. A search for something absent expands each state
at most once, so it cannot cost more than the graph holds. That is asserted as a
count, with no clock in it.

STEP 5 IS NOT. It runs both cases again with a leaving judgment live, and
compares the pair a second time.

## Why the missing half is the important one

THE SYMPTOM ONLY APPEARED UNDER LOAD. A route-failing call ran past thirty
seconds 36 per cent of the time, against 2 per cent for every other call.

A STANDING DEBT SAYS THE DRAWER READS A DECIDING STEP AS FAILED. With nothing
deciding, that path is never taken, so the quiet case cannot reach the bug at
all.

The spec says this in its own words: both are needed or the test proves nothing
about the condition it was written for.

## The blocker this entry shared with the surface row does not exist

BOTH ENTRIES SAID THE ENGINE HAS NO WAY TO MAKE A CALL RUN LONG ON PURPOSE.
Checked 2026-08-24, and that is false. `deliverable/tests/handback.test.ts` line
105 builds a state whose exit condition is a script and drives the script
machinery with it. Point that script at one that sleeps and the call runs long.

SO THE LOADED CASE IS WRITABLE TODAY: start a sleeping exit script on the state
being left, then run the reachable and unreachable searches beside it.

THIS ENTRY AND THE SURFACE ROW BOTH SAT BEHIND A BLOCKER NOBODY CHECKED, which
is how a repeated claim becomes a reason. Neither is blocked.

## What must not happen

THE ROW MUST NOT BE CLAIMED ON ITS CONTROL. A green quiet case is evidence about
a quiet machine. Saying so is the honest report; letting the count stand in for
the comparison is not.
