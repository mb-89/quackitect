---
id: adr-pager-handoff
decided_in: i0010_engine_workshop
type: adr
adjudicated_by: human
statement: Merge the HAND-OFF, never the nodes. When every undone dependency of a milestone gate is a ready killer subtask, one combined pager presents those killers and the gate. Blesses are recorded individually. A split answer stays possible. Substance and review remain separate records. Corollary (owner ruling, i10 M7): order is not dependency. depends_on edges state real prerequisites only, never display order, so agent-blessable fillers never stand between the user and the gate.
class: review
killer: false
---
## Rationale (not load-bearing)
A milestone gate often waits on nothing but ready killer subtasks.
Two separate hand-offs for that one moment add ceremony without adding a decision.
Merging the trace nodes was rejected, because the substance check and the review gate must stay separate records.
So only the ceremony merges.
One y blesses the group, each bless recorded on its own, and a split answer stays possible.
