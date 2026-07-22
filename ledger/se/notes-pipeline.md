---
id: se.notes-pipeline
kind: decision
statement: "Capture is frictionless: one file per note. It records provenance and asks once. Triage routes or rejects each note. Migration at quack start pulls scope. Retro runs at start, seeded by an end-of-iteration friction dump. A note is not a check."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_type: requirement
v1_adjudicated_by: human
v1_killer: "true"
v1_ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
---

## Rationale (not load-bearing)

Capture must stay separate from commitment, or either capture dies or the plan rots. Provenance is asked, never inferred.
