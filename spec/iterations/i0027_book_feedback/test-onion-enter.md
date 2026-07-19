---
id: test-onion-enter
type: test
statement: Entering an onion block pushes browser history; the back action exits it.
class: executed
verify: selftest:onion-enter
killer: false
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: skeleton value
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
