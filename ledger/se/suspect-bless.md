---
id: se.suspect-bless
kind: decision
statement: On any input change a check is flagged SUSPECT. It returns to DONE only when a human re-attests it. An explain-log records exactly what changed.
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

Silent auto-reopen feels like the tool undoing your work. Suspect + a one-keystroke bless puts 'done' back in the human's hands. (Doorstop suspect-links.)
