---
minted_in: i1
id: tsp-tour-run
type: "[[test-spec]]"
statement: A tour derives its stops from the live machinery, shows live instances, highlights the named part, and ends at the desk, verified by demonstration of a full tour.
method: "demonstration"
verifies:
  - "req-tour-ends-at-the-desk"
  - "req-tour-highlights-the-named-part"
  - "req-tour-reads-what-stands"
  - "req-tour-shows-live-instances"
files:
  - "none — the procedure below is the definition; the observed tour is the evidence"
---

## Scope

One full tour, taken as a newcomer would. The tour's forced-absence
claims are tested, not demonstrated — [[tsp-tour-resilience]].

## Approach

System level: run the tour end to end in a workspace with real standing
machinery, and watch each stop against its claim.

## Procedure

- Say "tour" at the desk. Observe per stop: the content derives from the
  live machinery, never a stored script.
- At each stop naming a part. Observe: the panel highlights that part.
- At each stop's example. Observe: a live instance of the named kind,
  never a general description.
- At the last stop. Observe: the tour returns to the desk and shows the
  offer list.
