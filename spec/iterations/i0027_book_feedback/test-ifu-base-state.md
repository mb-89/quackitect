---
id: test-ifu-base-state
type: test
statement: A setup IFU defines the idle state, and another IFU references it as its start rather than restating it.
class: executed
verify: selftest:ifu-base-state
killer: false
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: skeleton value
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
