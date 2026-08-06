---
id: req-misfit-said-not-seeded
type: "[[requirement]]"
statement: "If nothing the person said fits a vehicle, then the desk shall put the question back to the person, seeding zero records."
kind: functional
verify_method: test
breaks_if_removed: "The desk seeds a guess and a wrong assumption poisons everything downstream."
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed ext 6a
  - contract rule 5 (confirm before you compose)
priority: must
---
