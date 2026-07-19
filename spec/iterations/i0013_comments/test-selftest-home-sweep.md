---
id: test-selftest-home-sweep
type: test
statement: After a selftest run, no fixture workspace data home remains under the engine's data root.
class: executed
verify: selftest:selftest-home-sweep
killer: false
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
