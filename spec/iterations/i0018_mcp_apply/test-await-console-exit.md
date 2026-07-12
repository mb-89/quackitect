---
id: test-await-console-exit
type: test
statement: A running await ends when the call log records an engine call from another process on the workspace, and reports the handback to drain mode.
class: executed
verify: selftest:await-console-exit
killer: false
---
## Rationale (not load-bearing)
Arrives RED at M6; the selftest does not exist at compose time.
