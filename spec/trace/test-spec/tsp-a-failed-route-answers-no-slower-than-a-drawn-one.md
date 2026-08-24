---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: tsp-a-failed-route-answers-no-slower-than-a-drawn-one
type: "[[test-spec]]"
statement: A search that finds nothing expands each reachable state at most once, so reporting that nothing routes is bounded by the graph and cannot run on.
method: test
verifies:
  - req-a-target-that-cannot-be-reached-is-refused-quickly
files:
  - deliverable/tests/route.test.ts
---

## Steps

1. From one standing position, search for a target the drawing CAN reach.
2. From the same standing position, search for a target the drawing CANNOT
   reach.
3. Assert the unreachable search expanded no more states than the position can
   reach — above that it is revisiting, which is the unbounded case.
4. Assert the reachable search expanded FEWER states than the unreachable one,
   which is what returning as soon as the answer is known looks like from
   outside.
5. NOT BUILT YET. Run both again with a leaving judgment live, and compare the
   pair again. See
   [[raid-iss-the-loaded-half-of-the-failed-route-row-is-not-implemented]].
   Until it is built, the row is claimed on its control only, and the
   verification says so rather than letting the count stand in for the
   comparison.

## The name is older than the row and no longer describes it

THE FILE IS STILL CALLED `no-slower-than-a-drawn-one`, and that is what the row
used to demand. It demanded the impossible: to say there is no way, a search has
to look everywhere it can reach, while one that finds a way stops at the first.
Finding nothing therefore always costs more.

THE OWNER STRUCK IT, with the shape that was meant all along: if we find a
reason why there is no way to get there, we just return early.

THE ID STAYS because other nodes cite it, and renaming decays every citation. The
statement, the steps and the oracle all say what the row now means.

## The oracle

THE COUNT OF STATES EXPANDED, from one position, for both targets. A search that
goes round again expands more than the graph holds, and step 3 is what catches
it. Step 4 shows the successful search leaving early rather than exhausting.

### This row asked for medians, and they were dropped for a reason

BOTH SEARCHES ARE MILLISECOND-SCALE on this graph. A whole route of six hops
costs 68 ms, and one warm expand costs a tenth of a millisecond.

TWO SUCH MEDIANS DIFFER BY MORE BETWEEN RUNS THAN THE DEFECT WOULD MOVE THEM. A
test that fails on a busy machine teaches its reader to rerun rather than to
look.

THE COUNT IS THE SAME CLAIM WITHOUT THE MACHINE IN IT. A search that gives up
late expands more states, and expanding more states is what makes it slower.

## Why step 5 exists

THE MEASURED SYMPTOM ONLY APPEARS UNDER LOAD. A route-failing call ran past
thirty seconds 36 per cent of the time against 2 per cent for every other call,
and a standing debt says the drawer reads a step that is still deciding as
failed. With nothing deciding, the bug may not show at all.

SO THE QUIET PAIR IS THE CONTROL AND THE LOADED PAIR IS THE CASE. Both are
needed or the test proves nothing about the condition it was written for.

## What would make this test lie

VARYING THE POSITION INSTEAD OF THE TARGET. From one position with one target
you get either a route or none, never both, so the verifier must hold the
position and change what is aimed at. An earlier draft of the requirement said
"from the same position" without saying that, and a reviewer caught it.

## What this does NOT verify

THAT THE DEBT IS THE CAUSE. This spec asserts an outcome. Which mechanism made
the outcome fail is a separate question and it is carried by an assumption
rather than by a test.
