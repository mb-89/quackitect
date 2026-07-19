---
id: test-divergence-suspect
type: test
statement: A code change that breaks a declared model flips the conformance check SUSPECT.
class: executed
verify: selftest:divergence-suspect
killer: false
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
