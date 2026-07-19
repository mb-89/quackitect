---
id: test-vv-no-test-policy
type: test
statement: An unexplained no-test item or a TODO rationale fails the check.
class: executed
verify: selftest:vv-no-test-policy
killer: false
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: skeleton value
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
