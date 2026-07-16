---
id: req-system-overview
type: requirement
depends_on: []
statement: The book shall render the trace graph as its own numbered chapter placed before design input, paged one page per need. All nodes shall show by default, each marked with its chapter. When a reader clicks a graph item, the book shall open that item's table row expanded. It shall collapse the sibling rows and link back to the graph.
class: review
killer: false
phase: [operation]
discipline: [software, design]
quality: [usability]
---
## Rationale (not load-bearing)
field c35, ruled in scope.
Amended at the bs20 design discussion (2026-07-08): placement before design input; one page per need like the report; graph-to-table transport both ways; an item under several needs appears on each need page (accepted duplication); chapter renumbering ripples, numbers show in the sidebar (req-sidebar-order).
Further owner rulings (same discussion): REUSE the report's trace-graph machinery as much as possible; each node carries the chapter its item renders in; unlike the report, ALL nodes show by default (no collapsed start state).
