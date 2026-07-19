---
id: req-why-honest-delta
type: requirement
depends_on: []
statement: The why delta lister shall apply the deferral skip set and shall label a cache miss distinctly from a failure.
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
The why lister named inputs that had not changed; the delta must name exactly what moved, or say nothing moved.
