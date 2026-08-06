---
id: req-land-target-routes-to-gate
type: "[[requirement]]"
statement: "When the person sets landing as the walk's target, the engine shall route the walk to the land gate through states whose conditions pass."
kind: functional
verify_method: test
breaks_if_removed: "Finished work has no routed road to trunk; landing becomes a git act outside the record."
refines:
  - uc-land-work-on-trunk
source_refs:
  - uc-land-work-on-trunk step 1
  - uc-land-work-on-trunk step 2
priority: must
---
