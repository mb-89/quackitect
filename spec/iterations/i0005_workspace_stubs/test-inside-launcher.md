---
id: test-inside-launcher
type: test
statement: The committed launcher stub resolves an engine via env `QUACK_ENGINE`, then `.quack/engine.local`, then `PATH`, and forwards arguments; with none set it fails with a clear message. No engine binary is present in the committed tree.
verifies: [req-inside-launcher]
class: executed
verify: selftest:stubs
killer: false
---
## Rationale (not load-bearing)
selftest:stubs exercises the resolution order non-interactively.
