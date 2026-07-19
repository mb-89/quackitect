---
id: test-onion-clusters
type: test
statement: A clustered level renders the cluster as one enterable block with input and output buses and no core, nesting the same way.
class: executed
verify: selftest:onion-clusters
killer: false
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: skeleton value
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
