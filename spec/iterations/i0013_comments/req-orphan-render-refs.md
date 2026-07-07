---
id: req-orphan-render-refs
type: requirement
depends_on: []
statement: When a node renders through a view's rows, the book orphan lint shall count that node as referenced.
class: review
killer: false
phase: [maintenance]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
Pull law: the book is the truth - a node the reader can reach through a view is not an orphan. Ruling adopted at the i13 M2 gate; the view-curation alternative was rejected there.
