---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-the-mapping-is-checked-for-totality-when-the-machine-compiles
type: "[[option]]"
cluster: the-sizing
question: what happens when no rung matches
statement: "every difficulty the matrix can produce is checked against the mapping when the machine compiles, so a record whose mapping has a hole refuses to start rather than reaching the hole halfway through a walk"
found_by: prior-art
source: "compile-time totality checking, the standard treatment of a partial function in typed languages, and Nix's build-time feature resolution which fails the evaluation rather than the build — commissioned deep scan, 2026-08-20"
---

## Mechanism

A MAPPING FROM DIFFICULTIES TO RUNGS IS A FUNCTION, AND A PARTIAL ONE IS A BUG
THAT WAITS. The unmatched case exists only because nothing checks that the
mapping covers its domain. Where the domain is small and known — four change
sizes, however many difficulty values the vocabulary admits — coverage is
decidable before anything runs.

THE COMPILE IS ALREADY THERE. engine/iterations.ts:236 compiles the column at
pin time, and engine/rigor-matrix.ts:590 walks every row that applies. Checking
that each row's difficulty resolves to a rung is one pass over the same rows, at
the same moment, and the failure is a refusal to pin rather than a surprise at
state forty.

IT MOVES THE ERROR TO WHERE IT CAN BE FIXED. An unmatched rung discovered mid-walk
is discovered by an agent that cannot edit the mapping without leaving the state
it stands in. The same hole found at pin time is found by whoever is blessing the
record, with the whole matrix in front of them, before any work has been spent.

IT DOES NOT REPLACE THE RUN-TIME RULE, IT SHRINKS ITS POPULATION.
req-an-unmatched-rung-names-itself-and-publishes-no-driver still has to hold for
the cases totality cannot see — a mapping edited after the pin, a difficulty
computed rather than declared. The check makes those the only cases, instead of
the general case.

WHAT IT COSTS: it only works if the difficulty vocabulary is closed and knowable
at compile time. opt-score-the-work-at-dispatch-instead-of-declaring-it produces
a difficulty from the work in front of the walker, and there is no domain to
enumerate — under that option this check cannot exist at all. So the two are
genuinely incompatible, and evaluate-set should score them as a fork rather than
as two features.
