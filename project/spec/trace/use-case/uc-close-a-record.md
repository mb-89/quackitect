---
id: uc-close-a-record
type: "[[use-case]]"
statement: Close a record, ruling on every finding it produced rather than dropping them.
actor: stk-engineer-driving-agents
trigger: the work a record was holding is finished
precondition: the record's work has landed
guarantee: every finding is ruled applied or dismissed with a reason, the trunk is clean, and the record is archived
refines:
  - sty-close-the-day
priority: should
---

## Main scenario

1. The person asks to close the record.
2. The close does not proceed. The record's report comes up first.
3. Every finding in it wants a ruling: applied, or dismissed with the reason. Neither is a default.
4. The person rules each one, saying where an applied finding landed and why a dismissed one was rejected.
5. The record's strays are committed so the trunk is left clean.
6. The record is archived, readable exactly as it stood.

## Extensions

- 2a. The record produced no findings. It closes without the ruling step, and the empty report is itself the claim.
- 3a. A finding is neither applied nor dismissable yet. It becomes a note with the condition that brings it back, and the note is what closes it here.
- 4a. A dismissal has no reason. The close refuses — a dismissal without a reason is re-litigated in a month by somebody who was not there.
- 5a. Work has landed while the record stayed open. That is normal and needs no close; landing and closing are separate acts.
- 6a. A worktree is still bound to the record. It goes when the record archives, and its absence is what proves nothing unfinished survived.
