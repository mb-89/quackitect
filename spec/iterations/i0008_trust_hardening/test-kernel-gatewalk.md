---
id: test-kernel-gatewalk
type: test
verifies: [req-kernel-selftest]
statement: The gate state machine walks open, bless, done, dependency-hash change, suspect, re-bless on a fixture; executed checks recompute live throughout.
class: executed
verify: selftest:kernel-gatewalk
killer: false
---
