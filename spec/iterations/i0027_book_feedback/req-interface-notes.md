---
id: req-interface-notes
type: requirement
depends_on: []
statement: The spec shall model each boundary line of the context diagram as one interface connection note carrying its description.
class: review
killer: false
kind: interface
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: interface - this requirement is about the interface model itself
---
## The interface model (owner ruling, 2026-07-17)

- Neighbors and interfaces are one picture: every line crossing the system boundary in the context model IS an interface, and each is an input or output of quackitect.
- An interface is a `con-` note of the DECLARED `interface` connection kind (type layer). It is prose-bearing: an id, a statement, and a description.
- The description carries: the neighbor, what flows, the direction, and the channel it rides.
- This follows the standing rulings, not a new fight: [adr-connections-reified](../../decisions/adr-connections-reified.md) reifies prose-bearing relations; [adr-connection-lanes](../../decisions/adr-connection-lanes.md) puts them in `con-` notes, never one-file-per-trivial-edge.
- The current 6.2.2 neighbor view lacks these descriptions. Authoring them is part of this iteration's content pass.

## Rationale (not load-bearing)
The past decisions anticipated exactly this: reify what carries data, keep trivial edges cheap. An interface carries data.
