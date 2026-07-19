---
id: req-search-visible-hits
type: requirement
depends_on: []
statement: When search navigates to a hit, the book shall reveal it, highlight every hit, and offer previous and next shortcuts.
class: review
killer: false
kind: functional
provenance:
  class: schema-default (review)
  ears: tbd - no default, no derivation yet
  killer: schema-default (false)
  kind: agent-proposal: first of functional|quality|constraint|interface - veto or confirm
---
## Rationale (not load-bearing)
Field feedback: search hits inside collapsed sections were invisible; a hit must reveal its host section.
