---
id: req-decisions-folder
type: requirement
statement: If a decision node minted from this iteration onward lives outside spec/decisions/, then quack lint shall flag it.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [process]
quality: [functionality]
---
## Rationale (not load-bearing)
Forward-only, house style (like EARS and monotonic): the ~20 historical iteration-folder ADRs stay grandfathered with a since-marker; lint is a pure path check for newer nodes.
