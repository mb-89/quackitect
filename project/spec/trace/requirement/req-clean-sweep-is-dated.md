---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-clean-sweep-is-dated
type: "[[requirement]]"
statement: When a sweep finds zero findings, the engine shall record the clean verdict with its date.
kind: functional
verify_method: test
breaks_if_removed: Nobody can say when the method last agreed with itself.
breaks_how_badly: abrasive
refines:
  - uc-let-the-system-catch-up
source_refs:
  - uc-let-the-system-catch-up ext 2a
priority: could
---
