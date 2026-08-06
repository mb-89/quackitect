---
id: req-move-gated-on-entry
type: "[[requirement]]"
statement: "If the next state's entry conditions do not hold, then the engine shall keep the walk at the current state and name each unmet condition."
kind: functional
verify_method: test
breaks_if_removed: "The walk enters states whose preconditions failed, and evidence builds on missing input."
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step step 6
  - uc-take-a-step ext 6a
priority: must
---
