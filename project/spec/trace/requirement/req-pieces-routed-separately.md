---
id: req-pieces-routed-separately
type: "[[requirement]]"
statement: "When one message carries more than one piece of work, the desk shall sort the pieces and shall recommend a vehicle for each piece on its own."
kind: functional
verify_method: demonstration
breaks_if_removed: "Unrelated work bundles into one record whose gates fit none of it."
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed ext 1a
priority: should
---
