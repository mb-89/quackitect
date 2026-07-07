---
id: req-render-refs
type: requirement
depends_on: []
statement: Where a base view declares render refs with a depth, the book shall render each result row through the node renderer at that depth.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
ch3 use cases from a query with NOTHING lost: gate state, verdict links, depth mechanics ride the existing node renderer. Obsidian previews the same rows as a plain table.
