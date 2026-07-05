---
id: test-book-identity
type: test
verifies: [req-book-identity]
statement: A rendered book carries the merkle root, the active iteration, and the engine version; the stamped root equals the live root at render time.
class: executed
verify: selftest:book-identity
killer: false
---
## Rationale (not load-bearing)
TODO
