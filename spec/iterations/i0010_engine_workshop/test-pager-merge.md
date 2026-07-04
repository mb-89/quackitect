---
id: test-pager-merge
type: test
verifies: [req-pager-merge]
statement: With only ready killers and the gate left open, progress --pager emits one combined pager naming them all; open agent-blessable work suppresses the merge; two ready killers group with the gate.
class: executed
verify: selftest:pager-merge
killer: false
---
## Rationale (not load-bearing)
TODO
