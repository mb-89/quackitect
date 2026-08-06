---
id: req-overhaul-takes-only-unowned-drift
type: "[[requirement]]"
statement: "If a finding belongs to an open record, then the overhaul shall exclude the finding and name the owning record."
kind: functional
verify_method: test
breaks_if_removed: "Two vehicles fix one drift; the overhaul and the record collide in the same files."
refines:
  - uc-let-the-system-catch-up
source_refs:
  - uc-let-the-system-catch-up ext 1a
priority: should
---
