---
id: req-overhaul-closes-green
type: "[[requirement]]"
statement: "The engine shall close an overhaul only after a full-battery run started after the last fix reports zero failures."
kind: functional
verify_method: test
breaks_if_removed: "A sweep that touched everything closes unproven; the overhaul leaves the system worse."
refines:
  - uc-let-the-system-catch-up
source_refs:
  - uc-let-the-system-catch-up step 5
  - uc-let-the-system-catch-up ext 5a
priority: must
---
