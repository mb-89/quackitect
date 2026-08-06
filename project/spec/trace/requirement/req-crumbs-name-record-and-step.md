---
id: req-crumbs-name-record-and-step
type: "[[requirement]]"
statement: "The panel shall show the lit node with crumbs naming the containing record and the current step."
kind: functional
verify_method: demonstration
breaks_if_removed: "The reader sees a lit node but not which record or step it belongs to."
refines:
  - uc-resume-after-an-absence
source_refs:
  - uc-resume-after-an-absence step 3
priority: should
---
