---
id: test-inside-launcher
type: test
statement: The committed launcher stub resolves the global engine binary, then env `QUACK_ENGINE`, and forwards arguments; with neither present it fails with a clear message. No engine binary and no retired `.quack` lane is present in the committed tree.
verifies: [req-inside-launcher]
class: executed
verify: selftest:stubs
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
selftest:stubs exercises the resolution order non-interactively.
