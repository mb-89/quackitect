---
id: test-apply-field-ops
type: test
statement: set-field replaces a scalar in place, inserts a missing field inside the block, and refuses no-frontmatter files and nested blocks.
class: executed
verify: selftest:apply-field-ops
killer: false
provenance:
  statement: agent-authored against the stub per the red ritual
  class: schema-default (executed)
  killer: schema-default (false)
  verify: agent-authored
tests_red: exempt - red observed at mint 2026-07-19 (the c21 evidence in M6-build-plan); a later statement reword moved the node hash and the built-green test cannot re-observe (adr-red-unobservable)
---
## Rationale (not load-bearing)
Red-teamed at design: an insert that lands after the closing fence would corrupt the body while containing the right text, so the insert position is asserted against the fence.
