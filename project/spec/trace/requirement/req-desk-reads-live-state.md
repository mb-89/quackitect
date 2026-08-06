---
id: req-desk-reads-live-state
type: "[[requirement]]"
statement: "When the desk composes a recommendation, the desk shall derive it from the open records, the pending notes, and the doors standing at that moment."
kind: functional
verify_method: test
breaks_if_removed: "A recommendation built on stale state routes work into a record that no longer stands."
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed step 2
priority: should
---
