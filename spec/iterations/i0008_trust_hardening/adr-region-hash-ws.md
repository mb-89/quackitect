---
id: adr-region-hash-ws
type: adr
addresses: [req-design-hash-norm]
adjudicated_by: human
statement: Design regions fold ONE hash over whitespace-collapse-only normalization that PRESERVES case (a new normWS, not the statement norm) — chosen over reusing norm() verbatim, whose lowercasing would let a case-only code rename escape reopening; comments stay in the hash because in-region comments are design content.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
Sensitivity: the directive's operative words are "whitespace-collapse only"; "same norm as statements" was shorthand. Cost of the second tiny function is one line; cost of a silent case-rename escape is a stale blessed design. One-time recompute ripple = R5, handled in this iteration's walk.
