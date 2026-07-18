---
id: req-onion-enter
type: requirement
depends_on: []
statement: When the reader enters an onion block, the book shall push a browser history entry so the back action exits the block.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  ears: tbd - no default, no derivation yet
  killer: schema-default (false)
  kind: agent-proposal: first of functional|quality|constraint|interface - veto or confirm
---
## Interaction rules (owner, 2026-07-17)

- A single click on a block shows its details (see [req-onion-click](req-onion-click.md)).
- A double click enters the block or cluster.
- The double click is only needed when a single click already does something. A block with no details may be entered by a single click.
- The browser back action exits the entered block. Entering is a normal, reversible browser navigation.

## Rationale (not load-bearing)
The owner wants diving into a diagram to behave like normal web navigation, reversible with the browser back button.
