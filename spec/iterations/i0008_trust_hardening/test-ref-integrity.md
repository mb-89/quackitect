---
id: test-ref-integrity
type: test
verifies: [req-ref-integrity]
statement: A node referencing a missing id through any edge field makes the engine exit nonzero naming the dangling reference and its direction.
class: executed
verify: selftest:ref-integrity
killer: false
---
