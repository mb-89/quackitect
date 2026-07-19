---
id: req-drawing-is-spec
type: requirement
depends_on: []
statement: The engine shall treat a committed drawing as a spec artifact, not a trace node.
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
A committed drawing is a spec artifact, never a trace node; the fence rule lets drawings live in iteration folders without being parsed.
