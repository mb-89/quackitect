---
id: test-filter-unification
type: test
statement: The board facets ride the register's filter columns with zero-count holes visible, and the separate coverage board is gone from the book.
class: executed
verify: selftest:filter-unification
killer: false
provenance:
  statement: agent-authored at c7 per the M6 reopen ruling (one filtering surface)
  class: schema-default (executed)
  killer: schema-default (false)
  verify: agent-authored
---
## Rationale (not load-bearing)
Red-teamed at design: new columns alone pass while the board coexists, so the board's absence and the multi-valued class-matching wiring are asserted too.
