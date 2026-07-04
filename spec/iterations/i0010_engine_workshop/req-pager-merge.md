---
id: req-pager-merge
type: requirement
refines: [uc-single-handoff]
depends_on: []
statement: When every undone dependency of a milestone gate is a ready killer subtask, quack progress --pager shall present one combined pager naming those killers and the gate, blessing each individually on a single yes and accepting a split answer.
class: review
killer: false
---
## Rationale (not load-bearing)
Widened at the i10 M7 gate (owner ruling: order is not dependency). The original last-open-killer
form measured graph adjacency. The ceremony cost is USER DECISIONS. The merge fires whenever no
agent-blessable work stands between the user and the gate, killers plural.
