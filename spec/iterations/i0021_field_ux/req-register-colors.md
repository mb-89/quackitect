---
id: req-register-colors
type: requirement
statement: The register shall compute each row's traffic-light color from recorded provenance, never from self-reported confidence. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The register shall color a row green when its value is user-adjudicated or mechanically derived.
2. The register shall color a row yellow when a deferrable field holds its default.
3. The register shall color a row red when a core field holds an unadjudicated load-bearing assumption.
4. The register shall derive colors from recorded provenance fields only.

## Rationale (not load-bearing)
The register vision (seed NOTE-20260711-141259-seed-html-register-vision): self-reported LLM
confidence is a mood; provenance is a record. A red row IS an unrecorded decision - the agent
marks it explicitly during drafting.
