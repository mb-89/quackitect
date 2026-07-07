---
id: req-ai-drafting
type: requirement
depends_on: []
statement: When the book needs prose, the AI drafting step shall receive the spec-graph context and the style exemplars mechanically, and every draft shall enter carrying its provenance marks - unmarked prose never enters the book.
class: review
killer: false
phase: [engineering]
discipline: [process]
quality: [functionality]
---
## Rationale (not load-bearing)
The owner's ruling made structural: the AI writes every first draft, and the user improves it. The research's strongest causal finding backs the shape - hallucinated docs come from starved context; the cure is systematic context injection (State of Docs 2026). The marks are stamped by the pipeline at write time, never self-reported and never detected after the fact.
