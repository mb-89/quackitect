---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: tsp-work-moves-and-the-two-ends-agree
type: "[[test-spec]]"
statement: Placing a piece of work makes its destination owe it and releases the place it left, and breaking one into parts leaves the parts visible.
method: test
verifies:
  - req-placing-work-makes-the-destination-owe-it
  - req-moving-work-releases-the-state-it-left
  - req-a-hand-may-break-work-into-parts-and-the-parts-are-visible
files:
  - tests/work-moves.test.ts
---

## Scope

WHAT IT COVERS: a piece of work changing where it sits, and one becoming
several. Both ends of every move, because a move that lands without releasing is
the failure this exists to catch.

WHAT IS OUT: the surface that performs the move, which is demonstrated rather
than tested, and readiness, which decides whether an item is OFFERED rather than
where it sits.

## Approach

CROSS-CHECKS, from Right-BICEP. Every move is asserted at BOTH ends: the
destination's count went up and the origin's went down, in the same act. A test
asserting only the destination passes while work is owed twice.

INVERSE RELATIONS. Moving a piece back leaves both positions as they started,
which catches an accounting error a one-way check cannot see.

BOUNDARIES on the count: a position holding one item, and a position holding
none after a move out, because an empty position is where a wrong count hides.

COMPONENT LEVEL for the accounting, with the surface's own behaviour left to the
demonstration spec.

## Steps

Every case in the referenced file is one step. The load-bearing ones:

- PLACING MAKES THE DESTINATION OWE IT, and the destination cannot be left until
  that item is settled or moved on again.
- MOVING RELEASES THE ORIGIN in the same act. Both ends are asserted in one
  case, because separate cases can both pass while the two disagree.
- MOVED IS A REAL EXIT. A position whose last item moved away can be left, and
  the report says moved rather than reporting a failure.
- MOVING BACK RESTORES BOTH ENDS exactly, with no residue at either.
- BREAKING ONE INTO PARTS LEAVES THE PARTS VISIBLE, each addressable on its own,
  and the original says what it became rather than vanishing.
- A PART CAN BE SETTLED INDEPENDENTLY, and the position owes the parts rather
  than the whole once it is broken.
- PLACING WHERE IT ALREADY SITS CHANGES NOTHING and is not an error.

NO MANUAL STEP.
