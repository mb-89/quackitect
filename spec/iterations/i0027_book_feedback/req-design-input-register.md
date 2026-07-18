---
id: req-design-input-register
type: requirement
depends_on: []
statement: The book shall render design input as one register folding functions, use cases, functional requirements, and quality requirements, filtered by need and type.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## Design decision (owner, 2026-07-17)

- One register folds every design-input item: functions, use cases, functional requirements, quality requirements.
- The type filter distinguishes those four kinds.
- The need filter groups by the item's need.
- The register replaces the separate use-cases-and-functions section.
- Its filter columns follow the generic mechanism in [req-filter-pill-rule](req-filter-pill-rule.md).

## Rationale (not load-bearing)
One register is easier to read than scattered sections. Functions are first-class nodes now (see [req-function-nodes](req-function-nodes.md)), so they fold in like any other item.
