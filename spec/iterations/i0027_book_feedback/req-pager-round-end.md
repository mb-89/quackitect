---
id: req-pager-round-end
type: requirement
depends_on: []
statement: When a pager round ends, progress shall print a machine-readable line naming the gate and the verdict.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## Round-end semantics (owner rulings, 2026-07-17/18)

- When a round ends, progress prints a machine-readable line naming the gate and the verdict, and writes a pollable result file in the data home, so any harness observes the outcome without improvised file watches.
- CLOSING THE PAGE WINDOW ENDS THE ROUND AS A REJECTION. A closed window is an answer, not a limbo: the round records reject, the result line says so, and any waiting agent stops waiting.
- A y or n on the page ends the round with that verdict, as today.

## Rationale (not load-bearing)
The M1 and M3 hand-offs both left the agent blind to the round's outcome: a detached window swallowed the verdict, and a closed window left watchers running on a dead round. The owner ruled the close-as-rejection semantics on 2026-07-18.
