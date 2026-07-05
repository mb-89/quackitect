---
id: test-template-flow
type: test
verifies: [req-template-flow]
statement: At the docs-complete review, every document that strayed from its template carries a recorded reason, and every harvested document improvement landed in its template.
class: review
killer: false
---
## Rationale (not load-bearing)
The irreducible judgment residue (doc-tests doctrine): stray-vs-harvest is the adjudicator's read at M8, not a mechanical diff. The mechanizable half (templates exist, metadata resolves) lives in test-template-system.
