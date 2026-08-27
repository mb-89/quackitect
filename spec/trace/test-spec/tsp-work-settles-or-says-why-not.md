---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: tsp-work-settles-or-says-why-not
type: "[[test-spec]]"
statement: A piece of work reaches a terminal status with a stated reason where one is owed, and what happens to it afterwards depends on whether it lived inside a record.
method: test
verifies:
  - req-work-only-a-person-can-settle-says-so-on-its-face
  - req-a-close-that-is-not-done-carries-its-reason
  - req-work-outlives-its-state-or-goes-with-it-and-says-which
  - req-work-outside-a-record-goes-when-its-state-completes
  - req-a-carrier-grouping-ends-when-it-empties
files:
  - tests/work-settles.test.ts
---

## Scope

WHAT IT COVERS: the end of a piece of work. Who may end it, what an end that is
not plain completion owes, and what survives afterwards.

WHAT IS OUT: the fold at a record's close, which belongs to the archive spec.

## Approach

DECISION TABLE, because the outcome turns on two conditions crossed: the
terminal status reached, and whether the work sat inside a record. Four
combinations, each with its own expected fate.

ERROR CONDITIONS FORCED. A close at a non-done status WITHOUT a reason must be
refused, and the refusal is asserted against the prose a reader sees rather than
against the serialised object.

EQUIVALENCE CLASSES on who settles: a hand that may, and a hand that may not
because the item is marked person-only.

COMPONENT LEVEL, with the lifetime question checked by reading back after the
state completes rather than by trusting the write.

## Steps

Every case in the referenced file is one step. The load-bearing ones:

- PERSON-ONLY IS VISIBLE ON THE ITEM, before anything is attempted. A hand sees
  the limit on the item's face rather than discovering it at a refusal.
- AN AGENT SETTLING A PERSON-ONLY ITEM IS REFUSED, and the refusal names the
  rule.
- A CLOSE AT DONE NEEDS NO REASON.
- A CLOSE AT ANY OTHER TERMINAL STATUS IS REFUSED UNTIL A REASON STANDS, and the
  reason is on the item afterwards.
- WORK INSIDE A RECORD OUTLIVES ITS STATE. Reading it back after the state
  completes returns it.
- WORK OUTSIDE A RECORD GOES WHEN ITS STATE COMPLETES, and reading it back
  afterwards returns nothing.
- EVERY ITEM SAYS WHICH OF THE TWO LIFETIMES IT HAS, so the fate is declared
  rather than inferred from where it happens to sit.
- A GROUPING THAT EXISTS ONLY TO CARRY WORK IS REMOVED WHEN IT EMPTIES, and a
  grouping that exists for another reason is not.

NO MANUAL STEP.
