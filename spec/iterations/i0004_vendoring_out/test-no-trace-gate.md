---
id: test-no-trace-gate
type: test
statement: No trace-typed node (need/usecase/requirement/design/test/adr) is ever a task gate — asserted over the loaded graph.
class: executed
verify: selftest:no-trace-gate
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
New invariant self-test.
