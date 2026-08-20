---
minted_in: i1
id: cluster-the-bootstrap
type: "[[cluster]]"
name: acting on a whole tree from outside it, where half-done looks finished
coupling: shared-failure-mode
source_refs:
  - the function DSM at M4 partition-functions, 2026-08-09
  - the function DSM at M4 partition-functions, 2026-08-18
  - the function DSM at M4 partition-functions, 2026-08-19
---

## Rationale

IT WAS A CLUSTER OF ONE, THEN THREE, THEN FIVE, AND IS NOW SIX. i16 first added
`bring-forth-a-vehicle` and `bring-forth-a-project` beside `stand-up-a-product`.
It then added `take-an-update` and `report-what-the-vehicle-changed` when the
function set was rebuilt on 2026-08-18. i9 added `bring-the-product-up` on
2026-08-19, and that one does not fit the same way the other five do.

THE NAME CHANGED WITH THE LAST TWO. It said "producing a tree that did not
exist", which two of the five do not do. Taking an update rewrites a tree that
already exists, and reporting what a vehicle changed writes no tree at all.

WHAT SURVIVED THE FIRST WIDENING is the unit and the hazard. Five members act on
a WHOLE TREE, from OUTSIDE that tree. All six fail by leaving something that
looks finished and is not.

THE SIXTH BROKE THE UNIT AND KEPT THE HAZARD. That seam has its own section
below, and a finder has already minted an option on it.

## Why shared-failure-mode

ALL SIX FAIL THE SAME WAY. A design that solves that once solves it for all
six, and that is what makes them one cluster.

- `stand-up-a-product` carries [[req-setup-stops-before-partial]]. Its own
  rationale gives the reason: a half-installed machine is worse than an
  uninstalled one, because it looks finished.
- `bring-forth-a-vehicle` and `bring-forth-a-project` both carry
  [[req-an-act-writes-only-the-tree-it-produced]], whose refuse-rather-than-
  half-do facet is that same rule on a tree instead of a machine.
- `take-an-update` fails it hardest, because its half-done state is the one
  nobody can see. [[flow-applied-change]] records the shape: a migration that
  runs, succeeds and produces something wrong leaves a vehicle that looks
  updated.
- `report-what-the-vehicle-changed` fails it quietly. A report missing a path
  reads exactly like a report where that path did not change.
- `bring-the-product-up` fails it in front of a person. A lane that came up
  half-way looks exactly like one that came up. Its own controls name the
  shape: what a running window cannot pick up is announced rather than forced,
  which is refuse-rather-than-half-do wearing different clothes.

SAME-LIFECYCLE NO LONGER EVEN COMPETES. It was the second-best class while the
cluster held three functions that each ran once at the birth of a tree. Three of
the six now run over and over, so the class is false rather than weaker.

## The sixth member shares the hazard and not the unit

THE CLUSTER IS NAMED FOR ACTING ON A WHOLE TREE FROM OUTSIDE IT.
`bring-the-product-up` does not do that. It runs INSIDE the folder somebody has
open, every time they open it, and it touches no tree but that one.

SO ONE HALF OF THE BINDING HOLDS AND THE OTHER DOES NOT. The hazard is shared,
and it is the half the coupling class is named after. The unit is not.

THIS IS RECORDED RATHER THAN QUIETLY FIXED because the fix is a partition
decision, and M4 is where partitions are decided. The heuristics finder held
"group what changes together, separate what changes apart" against this cluster
and landed on exactly this seam. Its option is
[[opt-split-the-bootstrap-by-whether-the-tree-is-the-one-you-stand-in]].

THE COUNT WAS WRONG FOR PART OF 2026-08-19. This node said five and named five
while the corpus held six, because the member was added at partition-functions
and the node was not brought with it.

## One flow runs inside this cluster, and it is the newest thing here

THE CLUSTER SHARED NO FLOW UNTIL 2026-08-18 AND NOW SHARES ONE.
`report-what-the-vehicle-changed` produces [[flow-vehicle-inventory]] and
`take-an-update` consumes it. The earlier text in this node said the matrix
showed no edge inside this cluster at all, and that sentence is now wrong.

THAT EDGE IS NOT WHAT BINDS THE CLUSTER. One edge among five members is thin
evidence, and the hazard binds all five. [[cluster-the-walk]] shows what
`shared-data` looks like when data really is the force: three flows and the
matrix's only cycle.

WHY THE EDGE EXISTS AT ALL. [[req-overlay-drift-reported]] clause three says the
report of what a vehicle changed is what makes an arriving update decidable.
Without the inventory, taking an update is blind.

TWO MEMBERS SHARE AN OUTPUT WITHOUT SHARING AN EDGE, which is a separate fact.
`stand-up-a-product` and `bring-forth-a-project` both produce
`flow-scaffolded-product`. That records that a project can arrive two ways, not
that either feeds the other.

A CANDIDATE THAT SPLITS THIS CLUSTER PAYS ONE FLOW AND ONE HAZARD. The flow is
cheap. The hazard is not: refuse-or-complete then has to be solved separately in
each place, which is precisely the kind of rule solved well once and badly
twice.

## bring-forth-a-vehicle has no edges at all, and that is the requirement

IT IS STILL THE ONLY FUNCTION IN THE MATRIX WITH NEITHER AN INCOMING NOR AN
OUTGOING EDGE, and the two functions added on 2026-08-18 did not change that.
Every one of its flows crosses the system's boundary: `flow-repository` and
`flow-intent` arrive from outside, and `flow-vehicle` leaves to
[[nbr-descendant]].

IF ANY FUNCTION CONSUMED `flow-vehicle`, this system would hold a data path into
its own descendant. [[req-nothing-a-copy-does-reaches-its-source]] grades that
fatal, so the missing edge is the rule showing itself in the structure rather
than a hole in the wiring.

THE NEW MEMBERS DO NOT BREAK IT, and the direction each runs is why. Both of
them run INSIDE a vehicle, on that vehicle's own tree. `take-an-update` takes
what arrives from upstream and writes the tree it stands in.
`report-what-the-vehicle-changed` reads that same tree. Neither reaches a
descendant, and neither is reached by one.

THE SIBLING PROVES THE CONTRAST. `bring-forth-a-project` outputs
`flow-driven-tree` and `resolve-a-path` consumes it, because a driven tree stays
under this system's hand. A vehicle does not, and never may.

SO THE ONE CROSS-CLUSTER EDGE THIS ITERATION ADDED STILL RUNS TO
[[cluster-the-walk]], from `bring-forth-a-project` to `resolve-a-path`. It is
still the only one, checked again after the rebuild. Any candidate that
separates producing a driven tree from resolving a path into one has to carry
that edge across its own boundary.

## What the old text found, still standing

TWO OUTPUTS ARE CONSUMED BY NOBODY. `flow-toolchain` and
`flow-scaffolded-product` appear in no function's inputs. The scaffolded product
is very likely the repository under a second name, which is a gap in the flow
set rather than a missing function.

THAT WAS RECORDED AT i1 IN THIS NODE'S EARLIER TEXT and it is carried forward
here unchanged, because nothing since has closed it and i16 did not look.

## The rename, 2026-08-18

`bring-forth-a-copy` IS NOW `bring-forth-a-vehicle`, on the owner's ruling: "It's
not a copy. It's a vehicle. And we are the engine." Every mention in this node
moved with it.
