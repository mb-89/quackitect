---
id: test-chapter-titles
type: test
statement: Every chapter heading carries only the short title, and the split rule handles both dash and sentence separators.
class: executed
verify: selftest:chapter-title-split
killer: false
tests_red: exempt - the split fix and its test landed in one authoring pass, so no red was observable (adr-red-unobservable)
provenance:
  statement: agent-authored at c2 per the M6 reopen ruling
  class: schema-default (executed)
  killer: schema-default (false)
  verify: agent-authored
---
## Rationale (not load-bearing)
Red-teamed at design: asserting one known chapter passes while another leaks, so every rendered heading is length-bounded besides the pinned ch2 split.
