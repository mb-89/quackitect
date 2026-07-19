---
id: test-go-analysis
type: test
statement: The build fails on a planted vet or formatting finding and passes clean.
class: executed
verify: selftest:go-analysis
killer: false
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
