---
id: test-timeline-singular
type: test
statement: Every surface embeds the one shared timeline stylesheet exactly once, the old timeline fig kind is retired, and the dot-line svg is gone from the book.
class: executed
verify: selftest:timeline-singular
killer: false
provenance:
  statement: agent-authored at c12 per the M6 reopen ruling (one design, never two)
  class: schema-default (executed)
  killer: schema-default (false)
  verify: agent-authored
---
## Rationale (not load-bearing)
Red-teamed at design: asserting the shared block's presence alone passes while a local variant coexists, so the occurrence count is pinned to exactly one per surface. The replacement rule (a step that replaces a surface asserts the old one is GONE) applies: the retired fig kind and the absent svg are asserted, not assumed.
