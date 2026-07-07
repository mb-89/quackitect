---
id: req-verify-method
type: requirement
depends_on: []
statement: The test item shall declare method and level fields rendered in the verification matrix, and the requirement item shall name its verification field verify_method.
class: review
killer: false
phase: [engineering]
discipline: [process]
quality: [functionality]
---
## Rationale (not load-bearing)
Method (test/analysis/inspection/demonstration) and level (unit/integration/system/acceptance) per test; the bare verify key collides with the executed-check referent (template red-team finding 21).
