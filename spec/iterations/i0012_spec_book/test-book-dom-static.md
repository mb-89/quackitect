---
id: test-book-dom-static
type: test
verifies: [req-book-dom-static]
statement: Every content layer of a probe node is present in the emitted HTML source; the script block contains no content-creating call.
class: executed
verify: selftest:book-dom-static
killer: false
---
## Rationale (not load-bearing)
TODO