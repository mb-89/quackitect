---
id: test-book-orphans
type: test
verifies: [req-book-orphans]
statement: A node in no manifest and without an exclusion record is flagged; an excluded one is not.
class: executed
verify: selftest:book-orphan-lint
killer: false
---
## Rationale (not load-bearing)
TODO