---
id: test-responsive-status
type: test
statement: The status evaluation completes inside one second on a warm cache.
class: executed
verify: selftest:status-fast
tests_red: exempt - realized pre-i14 by the i10 status fast-path; seeded as the quality example (field c26) (adr-red-unobservable)
killer: false
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
