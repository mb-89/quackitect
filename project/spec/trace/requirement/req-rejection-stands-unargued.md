---
id: req-rejection-stands-unargued
type: "[[requirement]]"
statement: "When the person rejects the recommendation and names another vehicle, the desk shall carry out the named choice and shall re-present the rejected recommendation zero times."
kind: functional
verify_method: demonstration
breaks_if_removed: "The desk argues, the person repeats themselves, and routing costs more than the work."
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed ext 5a
  - ".se/req-mine-sebots.md: rumination (no mid-walk re-litigation)"
priority: should
---
