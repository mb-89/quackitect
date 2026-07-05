---
id: adr-figures-derived-set
type: adr
kind: architecture
chosen: [cand-fig-engine-svg]
rejected: [cand-fig-viewtime-js, cand-fig-committed-assets]
addresses: [req-book-figures]
adjudicated_by: human
statement: The engine derives a small fixed set of diagram kinds as inline SVG with real text - context star, building-block tree, timeline, stakeholder matrix - spike-gated at M5. Anything beyond the set is authored as inline SVG content by the drafting AI (provenance-marked like prose), with ASCII as the last fallback. View-time diagram rendering is rejected: the visual would be script-created.
class: review
killer: false
---
## Rationale (not load-bearing)
The cap is on automatic engine surface, not on figure count - deterministic layout of arbitrary graphs is the recorded infra grave (dagre exists for a reason). The AI-drawn inline SVG release valve keeps the diagrams-over-prose ruling generous at zero engine cost.
