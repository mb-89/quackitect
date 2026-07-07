---
id: req-conn-root
type: requirement
depends_on: []
statement: The identity root shall cover connection content - an edge change or a connection-prose change shall change the root.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
Closes the edge cousin of the queries trust gap: edge rationale must not mutate trust-invisibly (red-team finding 6).
