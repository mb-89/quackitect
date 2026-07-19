---
id: test-ifu-deck-pills
type: test
statement: Every IFU guide row in the guides table carries the open-the-slides pill at its end, wired to its deck.
class: executed
verify: selftest:ifu-deck-pills
killer: false
tests_red: exempt - the pill's test and build landed in one authoring pass, so no red was observable (adr-red-unobservable)
provenance:
  statement: agent-authored at c14 per the M6 reopen ruling
  class: schema-default (executed)
  killer: schema-default (false)
  verify: agent-authored
---
## Rationale (not load-bearing)
Red-teamed at design: a pill anywhere in the book would pass a bare contains, so the assertion pins the setup pill's exact wiring and a count of at least one pill per IFU deck.
