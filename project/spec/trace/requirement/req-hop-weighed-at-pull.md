---
id: req-hop-weighed-at-pull
type: "[[requirement]]"
statement: "When a pull is served, the engine shall weigh each candidate hop against the autonomy setting standing at that pull, one hop at a time."
kind: functional
verify_method: test
breaks_if_removed: "A setting read once at session start lets the agent enter steps the person just withdrew."
refines:
  - uc-set-the-autonomy
source_refs:
  - uc-set-the-autonomy step 3
priority: should
---
