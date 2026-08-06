---
id: req-graph-shows-open-and-deferred
type: "[[requirement]]"
statement: "The decision graph shall show the last standing checklist with its open nodes and every deferred item."
kind: functional
verify_method: demonstration
breaks_if_removed: "Open and deferred work is invisible; the returning reader re-derives the plan."
refines:
  - uc-resume-after-an-absence
source_refs:
  - uc-resume-after-an-absence step 5
priority: should
---
