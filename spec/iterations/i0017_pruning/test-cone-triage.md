---
id: test-cone-triage
type: test
statement: quack triage lists the suspect cone split into still-holds and needs-re-ruling, and bless --all refuses to touch OPEN gates.
class: executed
verify: selftest:cone-triage
killer: false
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
