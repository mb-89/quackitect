---
id: req-autonomy-moves-anytime
type: "[[requirement]]"
statement: "While a walk is in progress, the engine shall accept a new autonomy setting and apply it from the next pull onward, with zero restarted states."
kind: functional
verify_method: test
breaks_if_removed: "The dial locks at session start, and taking work back mid-walk forces a restart."
refines:
  - uc-set-the-autonomy
source_refs:
  - uc-set-the-autonomy step 1
  - uc-set-the-autonomy trigger
  - ".se/req-mine-sebots.md: the person's dial and the manual path"
priority: must
---
