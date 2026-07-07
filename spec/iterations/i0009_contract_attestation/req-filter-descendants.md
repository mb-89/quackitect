---
id: req-filter-descendants
type: requirement
statement: Where a descendants filter names a node, the report shall show only that node and its descendants — every node reaching it through refines, implements, verifies, or addresses edges, transitively.
depends_on: []
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [usability]
---
## Rationale (not load-bearing)
The cone view: pick a need or use case, see everything that hangs off it. Same traversal the suspect ripple uses, reused as a display predicate. Filter syntax joins the existing predicate forms (iteration, text, /regex/).
