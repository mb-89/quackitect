---
id: req-book-figures
type: requirement
depends_on: []
statement: Where a manifest unit references a figure, the book shall embed it inline in a text-based form that a language model reads - no external asset request.
class: review
killer: false
phase: [engineering]
discipline: [design]
quality: [functionality]
---
## Rationale (not load-bearing)
Owner ruling (i12 M2): diagrams and figures transport information better than prose - use them generously, in the book and everywhere, always in a machine-readable form (inline SVG with real text, Mermaid, ASCII). The architect reader (row 4) gets the context and building-block views as figures; the rendering mechanism is an M3 candidate (the report's trace graph is in-house prior art). The general rule is baked into the voice.
