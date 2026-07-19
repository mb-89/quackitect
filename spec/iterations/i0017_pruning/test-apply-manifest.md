---
id: test-apply-manifest
type: test
statement: quack apply replaces exact strings from a manifest byte-safely, refuses ambiguous and missing matches whole (no partial application), and dry-run leaves every file untouched.
class: executed
verify: selftest:apply-manifest
killer: false
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
