---
id: req-inbox-shows-count-and-age
type: "[[requirement]]"
statement: "The surface shall show the pending-note count and the age of the oldest pending note."
kind: functional
verify_method: demonstration
breaks_if_removed: "Pending notes rot unseen; the drain discipline dies."
refines:
  - uc-resume-after-an-absence
source_refs:
  - uc-resume-after-an-absence step 6
priority: should
---
