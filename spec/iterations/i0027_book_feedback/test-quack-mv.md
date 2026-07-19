---
id: test-quack-mv
type: test
statement: One mv renames the file and follows links, bare ids, edge lanes, and source, boundary-safe; a collision refuses; dry writes nothing.
class: executed
verify: selftest:quack-mv
killer: false
provenance:
  statement: agent-authored against the stub per the red ritual
  class: schema-default (executed)
  killer: schema-default (false)
  verify: agent-authored
tests_red: exempt - red observed at mint 2026-07-19 (the c20 evidence in M6-build-plan); a later statement reword moved the node hash and the built-green test cannot re-observe (adr-red-unobservable)
---
## Rationale (not load-bearing)
Red-teamed at design: a rename that only moves the file passes a file-exists check, so every reference class is asserted separately, and the longer-id fixture (man-ab beside man-a) pins the boundary rule.
