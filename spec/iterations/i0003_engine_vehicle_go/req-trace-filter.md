---
id: req-trace-filter
type: requirement
refines: [uc-review-report]
statement: The report trace graph has a single filter box that filters the graph live in the browser. The box accepts one unified expression. An iteration term filters by iteration: a bare iteration id (0001 means only that iteration) and the comparisons <= and >= and < and > against an iteration. Any other term matches a node id and statement, as plain text or as a /regex/. Terms combine with AND and OR. Focusing or clicking the box reveals help that explains both the iteration and the text syntax. On any change the visible subgraph re-layouts automatically on the client so it re-packs. The committed report keeps its deterministic server-baked layout as the initial state. Filtering and relayout are runtime view interactions and never change the determinism root.
depends_on: []
class: review
killer: false
---

## Rationale (not load-bearing)
M2. One box, not two: the parser classifies each term by shape (an iteration predicate looks like 0001 or <=0002; everything else is a text or /regex/ match), so the reader types one expression. On-focus help keeps the UI clean. v1 has AND binding tighter than OR and no parentheses. Auto-reorder runs a built-in cytoscape layout (breadthfirst, rooted at needs) over the visible subset, so no extra JS library is vendored. The determinism boundary is the key constraint: the integrity root is hashed over ledger data, not layout or view state, so live filtering does not conflict with req-behavior-parity.
