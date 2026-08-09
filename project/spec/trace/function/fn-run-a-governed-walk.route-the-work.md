---
id: fn-run-a-governed-walk.route-the-work
type: "[[function]]"
cluster: the-record-life
statement: turn a sentence about wanted work into the right vehicle to hold it
satisfies:
  - req-desk-takes-plain-words
  - req-desk-greets-walkable
  - req-desk-offers-a-tour
  - req-desk-states-the-folder-rule
  - req-recommendation-is-derived
  - req-record-opens-on-word
  - req-record-arrives-prefilled
  - req-routing-reasoning-recorded
  - req-small-fix-joins-open-record
inputs:
  - flow-intent
  - flow-repository
  - flow-note-inbox
outputs:
  - flow-recommendation
  - flow-open-record
controls:
  - the person's recorded choice, which is the only thing that opens a record
  - the open-record rule, which sends a small fix into what already exists
source_refs:
  - uc-get-work-routed
  - uc-open-an-iteration
---

## Rationale

SPLIT OUT ON THE OWNER'S RULING, 2026-08-07, from a function that had grown
to a sixth of the register.

It is one act with two halves that cannot be separated. The desk ADVISES,
deriving its recommendation from what actually stands rather than from a
document. Then it does the PAPERWORK, seeding the record prefilled so the
person confirms instead of composing.

Splitting those two would put the advice in one place and the record it
produced in another, with nothing joining them. The reasoning is recorded ON
the record for exactly that reason.

IT OPENS NOTHING ON ITS OWN JUDGMENT. The recommendation is derived; the
choice is the person's, and it is recorded. That is what separates routing
from deciding.
