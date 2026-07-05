---
id: test-quack-build
type: test
statement: quack build compiles the engine and re-baselines golden-root in one step; after it, selftest:parity is green.
verifies: [req-quack-build]
class: executed
verify: selftest:build
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
New self-test asserting the build determinizer wiring (re-baseline path).
