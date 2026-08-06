---
id: req-browse-touches-nothing-live
type: "[[requirement]]"
statement: "While the archive is browsed, the engine shall write zero changes to any live record, any machine state, and the walk."
kind: functional
verify_method: test
breaks_if_removed: "Reading history risks the running present, so nobody browses while work runs."
refines:
  - uc-browse-the-archive
source_refs:
  - uc-browse-the-archive step 1
priority: should
---
