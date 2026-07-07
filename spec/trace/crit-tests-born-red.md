---
id: crit-tests-born-red
type: criterion
metric: mechanized tests with a recorded RED observation before their first pass, divided by all mechanized tests
target: 100%
statement: Every mechanized test is observed failing before it first passes.
class: review
killer: false
---
The observe-red command runs a test and records it failing at its current hash. It refuses a passing test. The ledger keeps the birth-red record per test. The verification view reads those records.
