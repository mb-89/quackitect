---
id: req-tdd-sequence
type: requirement
refines: [uc-test-first-build]
statement: The implementation fragment enforces the order author-tests -> plan-build -> RED -> GREEN. A new coverage rule tests-red requires every new test to be observed FAILING before its design is realized; a test that is green with no realized design is SUSPECT.
depends_on: [req-shared-impl-fragment]
class: review
killer: true
---
