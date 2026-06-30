---
id: test-white-label
type: test
statement: Engine output is branded from argv[0] — the invoked name drives usage/version; the default is quack; a vehicle named otherwise reads as that name.
verifies: [req-white-label]
class: executed
verify: selftest:brand
killer: false
---
## Rationale (not load-bearing)
New self-test asserting brand() derivation.
