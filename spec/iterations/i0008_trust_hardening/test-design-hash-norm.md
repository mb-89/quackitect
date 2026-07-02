---
id: test-design-hash-norm
type: test
verifies: [req-design-hash-norm]
statement: Whitespace-only reformatting of a design region leaves its folded hash unchanged; editing a comment inside the region changes it.
class: executed
verify: selftest:design-hash-norm
killer: false
---
