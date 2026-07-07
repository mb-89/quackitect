---
id: req-verdict-order
type: requirement
depends_on: []
statement: The candidate verdict shall not depend on map iteration order, and quack lint shall flag a candidate claimed by more than one decision.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
Pre-existing nondeterminism found by the red-team (finding 11): book.go verdict() scans nodes in map order.
