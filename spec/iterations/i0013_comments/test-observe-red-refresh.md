---
id: test-observe-red-refresh
type: test
statement: observe-red --refresh on a still-failing amended test re-records the red at the new hash; on a passing test it is refused.
class: executed
verify: selftest:observe-red-refresh
killer: false
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
