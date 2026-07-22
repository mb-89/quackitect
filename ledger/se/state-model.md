---
id: se.state-model
kind: decision
statement: A check's completion state is derived from its evidence. It is never stored as a verdict.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_type: requirement
v1_adjudicated_by: human
v1_killer: "true"
v1_ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
p3_note: state derived from evidence, never stored
---

## Rationale (not load-bearing)

Status is a function of evidence, so a fresh session re-derives 'where am I' from the files; nothing to attest falsely.
