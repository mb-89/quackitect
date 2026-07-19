---
id: test-vv-result-links
type: test
statement: Each verification row links its latest recorded result.
tests_red: exempt - the b25 incident recovery folded authoring and build into one replay pass; no red was observable (adr-red-unobservable)
class: executed
verify: selftest:vv-result-links
killer: false
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: skeleton value
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
