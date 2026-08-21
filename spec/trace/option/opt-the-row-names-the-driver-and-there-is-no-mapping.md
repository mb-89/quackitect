---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-the-row-names-the-driver-and-there-is-no-mapping
type: "[[option]]"
cluster: the-sizing
question: what the mapping from difficulty to driver holds
statement: "each row names the worker it needs directly, which removes the rung, the standing mapping and the resolve step, at the price of editing every row when the roster changes"
found_by: without
source: "trimming — the mapping exists only to hold an indirection; if the indirection buys nothing the artifact does not need it"
---

## Mechanism

CUT OUT THE MIDDLE. Today a row names a rung, a mapping turns the rung into a
worker, and a function performs the lookup. Name the worker on the row and all
three go.

WHAT IT WOULD FIX IMMEDIATELY: the portability assumption. There is no shared
list to resolve differently on different hosts, because there is no list.

WHY THE INDIRECTION EXISTS, stated fairly because this option argues against
it. A roster changes more often than a process does. With a mapping, a retired
model is one line; without one, it is fifty-three rows and a risk of missing
some. That is the whole case for the rung and it is a good one.

WHY IT IS STILL WORTH ENUMERATING. The case above assumes the rung is a real
abstraction rather than a spelling. IF THE RATINGS TURN OUT TO CLUSTER — if
most of the matrix lands on two or three rungs — then the rung is doing very
little work and the mapping is an indirection with almost no fan-out, which is
the shape trimming exists to find.

THAT IS TESTABLE AND NOT YET TESTED. The first rating pass answers it, and this
option should be re-read at that moment rather than dismissed now.
