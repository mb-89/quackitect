---
id: test-defer-excludes-coverage
type: test
statement: A requirement a defer or veto decision scrap-addresses owes nothing to the coverage rules until its ready_when: no design, no test, no trace hole.
class: executed
verify: selftest:defer-excludes-coverage
killer: false
---
## Rationale (not load-bearing)
Class-guard (bugfix law): found live at i15 b8 - the deferred req-slack-channel holed designs-realized forever. The defer mechanism (scrap edge + ready_when, go-decisions) must carry through the coverage rules. Verifies req-coverage.
