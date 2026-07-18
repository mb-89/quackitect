---
id: test-attest-freshness
type: test
statement: A resident process sees a ledger bless written by another process; the attest memo never masks an external write.
class: executed
verify: selftest:attest-freshness
killer: false
provenance:
  class: skeleton value
  killer: schema-default (false)
  verify: skeleton value
---
## Rationale (not load-bearing)
TODO
