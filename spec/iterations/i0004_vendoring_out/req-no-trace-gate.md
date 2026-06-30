---
id: req-no-trace-gate
type: requirement
refines: [uc-self-workspace]
statement: An invariant — no trace-typed node (need, usecase, requirement, design, test, adr) is ever treated as a task gate. A lint/selftest check asserts it so the dangling-test-gate class of bug cannot regress.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
From the retro: trace-typed class:executed tests were once treated as task gates and dangled (fixed in isGate); make it a standing invariant.
