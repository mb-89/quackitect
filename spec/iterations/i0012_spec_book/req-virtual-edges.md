---
id: req-virtual-edges
type: requirement
depends_on: []
statement: Where edges are connection-stored, a base query shall resolve an item's edge properties from the graph exactly as if frontmatter-stored.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
Keeps vv-matrix and every edge-driven view working after migration. Named cost (owner accepts at M4): Obsidian previews of those views go empty; the book is the truth.
