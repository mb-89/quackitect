---
id: test-first-wins-lanes
type: test
statement: A console bless on an asked check resolves the pending mobile ask; the later tap is ignored and the first resolution stands.
class: executed
verify: selftest:first-wins-lanes
killer: false
tests_red: exempt - the verified requirement was amended post-build (combined-card ruling, owner 2026-07-09); the red at the moved hash was unobservable, the class red stands at the original observation (adr-red-unobservable)
---
## Rationale (not load-bearing)
Verifies req-first-wins-lanes. Observed red 2026-07-09 before the build; the requirement's statement later gained the combined-card ruling, moving this test's input hash.
