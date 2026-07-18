---
id: req-function-nodes
type: requirement
depends_on: []
statement: The engine shall represent each function as a first-class node connected to its need, migrated from the need's functions list.
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
## Design decision (owner, 2026-07-17)

- A function was a string in a need's `functions:` list. It gains no graph citizenship there.
- A function becomes its own node type. The need references the functions it needs.
- A function is part of the overall graph and is used like any other node type.
- For now a function connects only to its need. Functions stay awkward otherwise.
- Functions gain importance if risk analysis (FMEA) is added later. That is out of scope now.
- The existing `functions:` list entries migrate to function nodes. The list field retires after the migration.

## Rationale (not load-bearing)
Modeling functions as strings blocked connecting them into the graph. First-class function nodes let the design-input register and any later analysis treat them like use cases and requirements.
