---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: raid-iss-the-failed-route-test-asserts-the-converse-of-its-requirement
type: "[[raid]]"
kind: issue
statement: The requirement demands that reporting no route costs no more than reporting one, and the test under it asserts the opposite ordering; on the test's own fixture the requirement's measure is false while the test is green.
owner: the driving agent
trigger: it has happened, and a cold reviewer found it at the implementation gate
status: closed
impact: A green test stands under a demand it contradicts. Anyone reading the trace sees the row verified, and the demand as written cannot be met by any graph search.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - req-a-target-that-cannot-be-reached-is-refused-quickly
  - tsp-a-failed-route-answers-no-slower-than-a-drawn-one
---

## The contradiction, exactly

THE REQUIREMENT'S MEASURE says an answer reporting that nothing routes arrives no
slower than an answer reporting a drawn route from the same position. Failed no
slower than found.

THE TEST ASSERTS that finding at one hop cost no more than finding nothing.
Found no slower than failed. The other way round.

ON THE TEST'S OWN FIXTURE the failed search expands 41 states and the near one
about two. So the requirement's measure is FALSE on the data the test passes on.

## Why the requirement as written cannot be met

A SEARCH THAT FINDS SOMETHING STOPS EARLY. A search that finds nothing has to
exhaust every state it can reach before it can say so.

SO A FAILED SEARCH COSTS AT LEAST AS MUCH AS A FOUND ONE, always, for any graph
search. The demand is not strict; it is unsatisfiable.

## What the requirement almost certainly meant

ITS OWN EVIDENCE POINTS ELSEWHERE. The measurement behind it says 42 of 418
pulls answered that nothing routed, and 15 of the 23 pulls past thirty seconds
were among them.

THIRTY SECONDS IS NOT SEARCH COST. A whole route on this graph draws in 68
milliseconds. The symptom is a pathological tail, and the standing debt about
the drawer reading a deciding step as failed is the likelier cause.

SO THE DEMAND IS ABOUT THE TAIL, not about search ordering. A failed answer must
not be pathologically slower, and it is bounded by the graph rather than by
anything else.

## What closed it

THE OWNER STRUCK THE ROW AS IT STOOD (2026-08-24): "if we find a reason why there
is no way to get there, we just return early", and "don't leave a requirement in
that has a contradiction".

THE REQUIREMENT NOW DEMANDS THE EARLY RETURN and measures the bound that catches
a hang: each reachable state expanded at most once, never twice.

THE SPEC AND THE TEST FOLLOWED IT. The test's second assertion now shows the
successful search leaving early, and says in its own comment that it is not the
requirement's measure — which is the confusion that produced this entry.

## What must not happen

THE TEST MUST NOT BE LEFT GREEN UNDER THE OLD MEASURE. A row whose test asserts
the reverse of its demand is worse than an untested row, because the trace closes
over it.
