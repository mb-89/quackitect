---
minted_in: i1
id: if-walk-engine-to-account
type: "[[interface]]"
statement: Every dispatched call and every stamped claim lands in the account's log, role and channel on each.
source: el-walk-engine
destination: el-account
carries:
  - flow-dispatched-call
  - flow-stamped-claim
  - flow-findings-report
form: file
source_refs:
  - decompose-structure, the element matrix's owed cell
  - fn-run-a-governed-walk.guard-a-write
  - req-a-standing-break-reports-and-lands
---

Append-only, at dispatch time — the audit answers from this log alone.

## The findings half, added at i6

A WRITE GUARD THAT REPORTS RATHER THAN REFUSING PRODUCES A FINDING, and a
finding nobody records is the same as no check.

So the report rides this same crossing. It is not a second channel: the
call and what the guard found about it belong in one entry, and splitting
them would leave a reader joining two logs to answer one question.

NO NEW INTERFACE WAS NEEDED for it. The crossing already existed; the
element matrix owed one more flow across it.
