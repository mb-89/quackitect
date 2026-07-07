---
id: req-conn-one-lane
type: requirement
depends_on: []
statement: If one triple of kind, src, and dst appears in both the note lane and the jsonl lane, then the engine shall refuse the graph naming the duplicate.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
One edge, one lane. The promote determinizer is the legal move between lanes.
