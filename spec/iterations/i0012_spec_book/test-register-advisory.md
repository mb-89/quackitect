---
id: test-register-advisory
type: test
statement: Over-register fixture prose yields advisory findings; the lint exit stays zero on advisory-only findings and the signals name the offending units.
class: executed
verify: selftest:register-advisory
killer: false
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
