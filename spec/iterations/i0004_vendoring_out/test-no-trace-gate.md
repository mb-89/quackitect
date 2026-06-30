---
id: test-no-trace-gate
type: test
statement: No trace-typed node (need/usecase/requirement/design/test/adr) is ever a task gate — asserted over the loaded graph.
verifies: [req-no-trace-gate]
class: executed
verify: selftest:no-trace-gate
killer: false
---
## Rationale (not load-bearing)
New invariant self-test.
