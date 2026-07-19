---
id: crit-render-book
type: criterion
weight: 0.15
metric: zero-external-service render into the single-file book (0-1)
target: models render offline in the design output chapter
statement: The axis weighs rendering the model into the single-file book without external services.
class: review
killer: false
---
## Rationale (not load-bearing)
Weight 0.15 - req-models-in-book, owner commission ("models show up in the book's design output part"). Anchors - 1.0: vendorable JS lib (mermaid.js; the cytoscape precedent); 0.7: trivial hand-rolled SVG (boxes and edges); 0.5: hand-rolled sketch renderer; 0.1: JVM or render server only.
