---
id: req-conn-adjacency
type: requirement
depends_on: []
statement: When quack connections runs with a node id, the engine shall print every connection touching that id - from the jsonl lane, the note lane, and code-derived implements edges - in deterministic order.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
The single-index benefit lives in the determinizer, not the storage: no consumer knows lanes. Code-derived implements merges in so the view never lies.
