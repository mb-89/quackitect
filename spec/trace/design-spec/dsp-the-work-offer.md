---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: dsp-the-work-offer
type: "[[design-spec]]"
statement: the hot-path reads — what a hand may take now, and how much a position still owes per slot
realizes:
  - "el-work-offer"
  - "if-sizing-to-work-offer"
  - "if-work-offer-to-mirror"
files:
  - "deliverable/engine/workoffer.ts"
---

## Responsibility

TWO READS, BOTH ON THE HOT PATH. What a hand may take now, and how much a
position still owes.

THIS MODULE WRITES NOTHING. That is the cut, and it is sharper than a
read-against-write split because it is true: the store serves two reads itself,
and this one serves no writes at all.

## Behavior and constraints

EVERYTHING IS READY UNLESS AN ORDER WAS WRITTEN DOWN. The common case costs no
check, and only a declared predecessor costs one. A design where the ordinary
case needs a declaration is the one this rule exists against.

A PREDECESSOR IS ONE OF TWO KINDS. Another piece of work reaching the outcome
its edge names, or a whole POSITION finishing. A position has no outcome; it
finishes when everything in it is settled or moved. The second is one fact
rather than a list over the position's items.

A DIFFERENT TERMINAL OUTCOME DOES NOT RELEASE A WAIT. The edge names an outcome,
not merely an ending.

## How a wait is written down

THE DESIGN NAMED TWO KINDS AND NOT THEIR SHAPE, so the build settled it. A piece
of work carries a list, and an empty list is the ordinary case.

- `work:<id>:<outcome>` waits on another piece reaching a NAMED outcome. The
  outcome is part of the edge because a different ending must not release it.
- `position:<id>` waits on a whole position finishing. It carries no outcome,
  because a position has none.

AN EDGE NOBODY CAN READ WITHHOLDS THE WORK AND SAYS SO. It is never treated as
no edge at all, which would silently offer work that declared a wait.

DIFFICULTY IS READ, NEVER DECIDED HERE. The sizing publishes one figure per
piece of work and this module filters on it. An unmatched rung publishes no
strength, and the work is withheld rather than offered to a hand that may not
carry it.

THE COUNT IS TWO NUMBERS PER POSITION, one per slot: what must still be taken
in, and what must still be produced. It crosses to the surface as a figure, so
the surface draws a number rather than deriving one.

## Why the count is not on the write path

EVERY LOOK AT A POSITION COUNTS. Only entering one mints. Putting the count
beside the mint would make every entry pay for a derivation that belongs to
every look.

AND ONLY ONE OF THE TWO ENDS CAN THEN BE WRONG. A wrong count drawn beautifully
is worse than a right count drawn plainly, so the figure is produced here and
consumed there.

## Emergency lifts the work gate

WORK NEVER HOLDS A TRANSITION WHILE EMERGENCY IS ARMED. In emergency the walk
moves wherever it wants, independent of what work stands open.

IT FITS WHAT EMERGENCY ALREADY IS. The engine's own description of it is that
every tool is legal in every state. A work gate surviving that would be a second
cage the same switch does not open.

LIFTING THE GATE IS NOT HIDING WHAT WAS BEHIND IT. The answer still carries the
open work, so a person can see what they are moving past.

## Failure behaviour

AN UNREADABLE PIECE OF WORK IS REPORTED, never skipped. A count that quietly
omits one is worse than a count that refuses.

A COUNT THAT CANNOT BE PRODUCED IS ABSENT, never zero. A zero and an unknown
look identical on a surface and mean opposite things.

## What it leans on

THAT READINESS IS CHEAP TO DERIVE, because most work declares no predecessor.

THAT THE DIFFICULTY IS ALREADY PUBLISHED, so this module reads a figure rather
than computing one on the hot path.
