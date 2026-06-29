---
id: suspect-bless
statement: On any input change a check is flagged SUSPECT. It returns to DONE only when a human re-attests it. An explain-log records exactly what changed.
type: requirement
refines: [uc-engage-next]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)

Silent auto-reopen feels like the tool undoing your work. Suspect + a one-keystroke bless puts 'done' back in the human's hands. (Doorstop suspect-links.)
