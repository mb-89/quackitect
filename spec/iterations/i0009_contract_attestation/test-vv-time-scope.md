---
id: test-vv-time-scope
type: test
verifies: [req-vv-time-scope]
statement: A test node from a later iteration is excluded from an earlier iteration's coverage computation; the latest iteration's computation includes every earlier test node.
class: executed
verify: selftest:vv-time-scope
killer: false
---
