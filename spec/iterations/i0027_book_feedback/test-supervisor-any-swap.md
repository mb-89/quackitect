---
id: test-supervisor-any-swap
type: test
statement: A ratchet rebuild swaps the MCP child without a harness reconnect.
class: executed
verify: selftest:supervisor-any-swap
killer: false
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: skeleton value
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
