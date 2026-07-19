---
id: test-iterations-compacted
type: test
statement: Compacting a shipped fixture iteration preserves its ledger hashes and evidence while shrinking its working set.
class: executed
verify: selftest:iterations-compacted
killer: false
---
## Rationale (not load-bearing)
Not applicable - the verify line binds this test to its check; the why lives with the requirement it verifies.
