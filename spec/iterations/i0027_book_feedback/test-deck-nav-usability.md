---
id: test-deck-nav-usability
type: test
statement: The rendered deck clamps navigation at both ends and carries a clickable ESC pill that exits present mode.
tests_red: exempt - the clamp and the ESC pill were already built with the deck lane; no red is observable (adr-red-unobservable)
class: executed
verify: selftest:deck-nav-usability
killer: false
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: skeleton value
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
