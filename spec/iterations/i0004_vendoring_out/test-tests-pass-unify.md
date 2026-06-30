---
id: test-tests-pass-unify
type: test
statement: A selftest:-verified test passes inside the tests-pass coverage rule — proving tests-pass and the gate state machine use the same executed-check evaluator.
verifies: [req-tests-pass-unify]
class: executed
verify: selftest:tests-pass-eval
killer: false
---
## Rationale (not load-bearing)
New self-test guarding against the two-path divergence.
