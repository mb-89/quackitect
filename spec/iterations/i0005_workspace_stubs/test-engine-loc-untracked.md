---
id: test-engine-loc-untracked
type: test
statement: The committed stub set carries no absolute engine path, no engine binary, and no machine-local state; engine resolution lives only in the launcher's runtime order.
class: executed
verify: selftest:stubs
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---
## Rationale (not load-bearing)
selftest:stubs checks the ignore rules and scans the committed set for leaked paths.
