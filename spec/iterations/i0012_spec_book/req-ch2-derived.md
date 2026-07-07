---
id: req-ch2-derived
type: requirement
depends_on: []
statement: The book shall derive the fundamentals chapter's lists - references, notation, fundamentals - from usage alone, and an entry without a using link shall not render.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
The pull law: everything in ch2 exists only because something downstream required it (LaTeX model: cite builds the bibliography, gls builds the glossary). Normative and informative references render apart (ISO clause-2 style). Fundamentals list slug+one-liner in ch2; full bodies render in guidance.
