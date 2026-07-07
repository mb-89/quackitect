---
id: req-filter-dblclick
type: requirement
statement: When a graph node is double-clicked, the report shall apply the descendants filter for that node.
depends_on: [req-filter-descendants]
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [usability]
---
## Rationale (not load-bearing)
Gesture shortcut for the same predicate — no typing the id. Clear control (req-filter-clear) is the way back out.
