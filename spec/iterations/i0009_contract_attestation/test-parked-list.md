---
id: test-parked-list
type: test
verifies: [req-parked-list]
statement: decisions --parked lists a live defer, excludes a superseded one, and is empty when no defers exist.
class: executed
verify: selftest:parked-list
killer: false
---
