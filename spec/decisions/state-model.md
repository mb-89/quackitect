---
id: state-model
statement: A check's completion state is derived from its evidence. It is never stored as a verdict.
type: requirement
refines: [uc-engage-next]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)

Status is a function of evidence, so a fresh session re-derives 'where am I' from the files; nothing to attest falsely.
