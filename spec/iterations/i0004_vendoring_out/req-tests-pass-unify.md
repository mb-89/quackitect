---
id: req-tests-pass-unify
type: requirement
statement: The tests-pass coverage rule evaluates executed checks through the SAME in-process evaluator as the gate state machine — not a divergent shell path. A selftest asserts that a selftest:-verified test passes inside tests-pass, so the two paths cannot silently diverge again.
depends_on: []
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
From the retro: tests-pass used runExecuted (shell) while gateState ran selftest: in-process; a selftest:-test was always-fail, masked by stale evidence, surfacing only on an uncached test.
