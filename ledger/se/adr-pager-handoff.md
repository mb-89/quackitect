---
id: se.adr-pager-handoff
kind: decision
statement: "Merge the HAND-OFF, never the nodes. When every undone dependency of a milestone gate is a ready killer subtask, one combined pager presents those killers and the gate. Blesses are recorded individually. A split answer stays possible. Substance and review remain separate records. Corollary (owner ruling, i10 M7): order is not dependency. depends_on edges state real prerequisites only, never display order, so agent-blessable fillers never stand between the user and the gate."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0010_engine_workshop
v1_type: adr
v1_adjudicated_by: human
v1_class: review
v1_killer: "false"
v2_amendment: merges into evidence-form briefs (killers + gate, one page)
---

## Rationale (not load-bearing)
A milestone gate often waits on nothing but ready killer subtasks.
Two separate hand-offs for that one moment add ceremony without adding a decision.
Merging the trace nodes was rejected, because the substance check and the review gate must stay separate records.
So only the ceremony merges.
One y blesses the group, each bless recorded on its own, and a split answer stays possible.

## v2 amendment (applied at mint)

merges into evidence-form briefs (killers + gate, one page)
