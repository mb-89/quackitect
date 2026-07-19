---
id: req-supervisor-any-swap
type: requirement
depends_on: []
statement: When the engine binary changes by any means, the MCP supervisor shall swap the child and emit a tools list_changed notification.
class: review
killer: false
kind: functional
provenance:
  class: schema-default (review)
  ears: tbd - no default, no derivation yet
  killer: schema-default (false)
  kind: agent-proposal: first of functional|quality|constraint|interface - veto or confirm
---
## Rationale (not load-bearing)
The 2026-07-18 four-process wedge: a swap that cannot force through wedges every later call; the supervisor must kill its child deterministically and sweep the parks.
