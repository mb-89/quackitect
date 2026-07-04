---
id: test-verify-cache
type: test
verifies: [req-verify-cache]
statement: A second evaluation with unchanged inputs consumes the recorded verdict and runs zero tests. An edited test or a new engine build re-runs exactly the misses.
class: executed
verify: selftest:verify-cache
killer: false
---
## Rationale (not load-bearing)
TODO
