---
id: test-ch3-needs-intro
type: test
statement: The needs chapter opens with linking prose before the needs list.
class: executed
verify: selftest:ch3-needs-intro
killer: false
tests_red: exempt - the c3 sharpening asserts the needs list's absence, a property already true when the assertion was written, so no red was observable (adr-red-unobservable)
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: skeleton value
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
