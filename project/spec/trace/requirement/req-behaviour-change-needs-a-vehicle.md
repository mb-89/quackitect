---
id: req-behaviour-change-needs-a-vehicle
type: "[[requirement]]"
statement: "If a fix changes behaviour instead of restoring consistency, then the overhaul shall refuse the fix and name a record as its vehicle."
kind: functional
verify_method: demonstration
breaks_if_removed: "Behaviour changes ship inside a sweep, unadjudicated and untraced."
refines:
  - uc-let-the-system-catch-up
source_refs:
  - uc-let-the-system-catch-up ext 3a
priority: should
---
