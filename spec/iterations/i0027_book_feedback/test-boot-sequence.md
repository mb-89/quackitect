---
id: test-boot-sequence
type: test
statement: The boot command emits the fixed sequence and its completion state.
class: executed
verify: selftest:boot-sequence
killer: false
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: skeleton value
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
