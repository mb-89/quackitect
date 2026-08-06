---
id: req-unsatisfying-fill-marked-not-deleted
type: "[[requirement]]"
statement: "If a filled entry no longer satisfies the corrected guidance, then the engine shall mark it with what moved and shall delete nothing."
kind: functional
verify_method: test
breaks_if_removed: "Stale work silently passes a rule it no longer meets, or the correction destroys finished work; either way the record is poisoned."
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - uc-change-the-method-mid-walk ext 4a
  - ".se/req-mine-v2.md: v2-051 edits suspect dependents"
  - ".se/req-mine-v1.md: gates, blesses — evidence hash flips the gate suspect"
priority: must
---
