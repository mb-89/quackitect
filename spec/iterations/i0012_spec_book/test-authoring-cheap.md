---
id: test-authoring-cheap
type: test
statement: After a spec content change, one quack build yields a green honest board: no stale verdict survives, no second build is needed, no false delta row shows.
class: executed
verify: selftest:authoring-cheap
killer: false
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.