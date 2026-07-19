---
id: test-risk-matrix
type: test
statement: The matrix renders one bubble per open RAID item, colored by kind, filterable by kind and status, and a bubble click fills the details pane.
class: executed
verify: selftest:risk-matrix
killer: false
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: skeleton value
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
