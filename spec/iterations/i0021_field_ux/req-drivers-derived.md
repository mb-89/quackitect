---
id: req-drivers-derived
type: requirement
statement: The book's drivers table shall render the derived union of requirements addressed by an architecture ADR and hand-tagged requirements. Each row shall name its deciding ADRs. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The drivers table shall list every requirement addressed by at least one kind:architecture ADR.
2. The drivers table shall additionally list every requirement carrying the architecturally-significant tag.
3. Each drivers row shall name the ADR or ADRs that make the requirement architecturally significant.

## Rationale (not load-bearing)
Owner rework note NOTE-20260712-141758: ch 10.5 is a one-row table because curation never
happened. Derived-union is self-maintaining - the addresses edges already exist; the hand tag
stays for judgment cases no ADR touched. Same philosophy as the register: computed, never
confessional.
