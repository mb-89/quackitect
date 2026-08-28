---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: tsp-what-is-ready-and-who-can-take-it
type: "[[test-spec]]"
statement: A piece of work is withheld only where it declared something to wait for, it carries how hard it is, and it records that a hand is on it before that hand acts.
method: test
verifies:
  - req-readiness-is-derived-from-a-declared-dependency
  - req-work-carries-how-hard-it-is
  - req-work-says-when-a-hand-is-on-it
files:
  - tests/work-offered.test.ts
---

## Scope

WHAT IT COVERS: the two filters between a piece of work and a hand, and the mark
that goes on when the hand takes it.

WHAT IS OUT: which hand a difficulty resolves to, which is the sizing's own
concern and is unchanged by this record.

## Approach

EQUIVALENCE CLASSES ON THE EDGE. Three classes: no declared predecessor, a
predecessor naming another piece of work, and a predecessor naming a whole
position. The owner ruled both edge kinds in, so both get cases.

THE DEFAULT IS THE LARGEST CLASS and it is checked first: everything is ready
unless an order was written down. A design where the common case needs a
declaration is the failure this catches.

BOUNDARY ON THE OUTCOME an edge names. The predecessor reaching the named
outcome releases the wait; reaching a DIFFERENT terminal outcome does not.

STATE GRAPH for the in-progress mark: not taken, taken, settled. The event that
must cause no transition — a second take — gets its own case.

COMPONENT LEVEL.

## Steps

Every case in the referenced file is one step. The load-bearing ones:

- WORK DECLARING NOTHING IS OFFERED AT ONCE. This is the ordinary case and it
  costs no check.
- WORK WAITING ON ANOTHER PIECE IS WITHHELD until that piece reaches the outcome
  its edge names.
- REACHING A DIFFERENT TERMINAL OUTCOME DOES NOT RELEASE IT, so the edge names
  an outcome rather than merely an ending.
- WORK WAITING ON A POSITION IS WITHHELD until that position finishes, which is
  one fact rather than a list over the position's items.
- EVERY ITEM CARRIES A DIFFICULTY, and an item with none is reported rather than
  offered to any hand.
- A HAND IS OFFERED ONLY WHAT ITS STRENGTH COVERS, and the withholding is
  visible rather than silent.
- TAKING MARKS THE ITEM BEFORE THE HAND ACTS, so the mark is what the progress
  account is derived from.
- A SECOND TAKE ON THE SAME ITEM IS REFUSED, because the first already moved its
  status.

NO MANUAL STEP.
