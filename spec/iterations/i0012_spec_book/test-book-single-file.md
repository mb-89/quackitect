---
id: test-book-single-file
type: test
verifies: [req-book-single-file]
statement: A rendered book is one file; it names no external URL in any src, href-to-asset, or fetch.
class: executed
verify: selftest:book-single-file
killer: false
---
## Rationale (not load-bearing)
TODO