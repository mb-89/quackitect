---
id: test-call-log-lifecycle
type: test
statement: A capped call log is retained and its aggregate surrendered at the retro.
class: executed
verify: selftest:calls-summary log-retention
tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)
killer: false
---
## Statements
1. quack calls --summary on a fixture log prints counts, failure rate, slow calls, and channel mix, then deletes the log; a second run reports an empty log. *(was test-calls-summary)*
2. A call log grown past its cap is trimmed to the cap with the newest lines kept. *(was test-log-retention)*
