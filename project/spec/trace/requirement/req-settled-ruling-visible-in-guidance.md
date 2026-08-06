---
id: req-settled-ruling-visible-in-guidance
type: "[[requirement]]"
statement: "Where a walk-governing rule records a settled decision as its source, the engine shall serve that decision's reference with the guidance."
kind: functional
verify_method: inspection
breaks_if_removed: "A walker cannot tell a defect from a ruling, so settled decisions are re-litigated as bugs mid-walk."
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - uc-change-the-method-mid-walk ext 5a
  - ".se/req-mine-sebots.md: capture, decisions, change"
priority: could
---
