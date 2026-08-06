---
id: req-record-opens-on-word
type: "[[requirement]]"
statement: "The engine shall open an expedition or an iteration only on the person's recorded choice."
kind: functional
verify_method: test
breaks_if_removed: "Records open on an agent's guess and the person loses the one control the method gives them."
refines:
  - uc-get-work-routed
  - uc-open-an-iteration
source_refs:
  - uc-get-work-routed step 5
  - uc-get-work-routed ext 5a
  - contract rule 8 (never open a record unasked)
  - uc-open-an-iteration step 1
priority: must
---
