---
id: state-model
statement: A check's completion state is derived from its evidence, never stored as a verdict.
depends_on: [evidence-model, suspect-bless]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)

Status is a function of evidence, so a fresh session re-derives 'where am I' from the files; nothing to attest falsely.
