---
id: test-verify-pins-build
type: test
statement: A binary swap mid-battery is detected and the battery re-runs under the final build.
class: executed
verify: selftest:verify-pins-build
killer: false
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: skeleton value
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
