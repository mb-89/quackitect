---
id: req-conn-jsonl
type: requirement
depends_on: []
statement: When a kind folder under spec/connections holds edges.jsonl, the engine shall load every line as one edge of that kind, and shall refuse a malformed line or an unresolvable endpoint naming the file and line.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
The bulk lane for trivial kinds - ledger-style JSONL, one line per edge {src,dst[,q]}. Option A ruling: an edge lives in exactly one lane.
