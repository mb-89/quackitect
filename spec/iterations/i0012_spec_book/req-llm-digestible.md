---
id: req-llm-digestible
type: requirement
depends_on: []
statement: The book shall be digestible by a language model without a companion artifact - text extraction preserves the layer labels, the normative statements, and the trust metadata; a separate index is emitted only where extraction alone proves insufficient.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [portability]
---
## Rationale (not load-bearing)
Owner ruling (i12 M2): the requirement is LLM digestibility, not a specific solution. If the model reads the HTML fine, no llms index is needed - the index is a fallback realization, decided at M3/M4 on evidence, not a committed output. The M7 book-legibility probe validates the outcome with a real model; the extraction-fidelity core is mechanized as the test.
