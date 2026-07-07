---
id: req-mint-all-kinds
type: requirement
depends_on: []
statement: The mint command shall emit a field-complete skeleton for every item kind.
class: review
killer: false
phase: [engineering]
discipline: [process]
quality: [functionality]
---
## Rationale (not load-bearing)
go-mint's own principle: the agent fills content, never authors shape - yet mint covers 5 of 13 kinds today (template red-team finding 20). Includes the adjudicated_by vocabulary fix (user, not human).
