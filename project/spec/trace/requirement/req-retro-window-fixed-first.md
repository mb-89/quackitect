---
id: req-retro-window-fixed-first
type: "[[requirement]]"
statement: "When a retro opens, the engine shall record the set of pending note refs as the retro's window before it accepts the first drain."
kind: functional
verify_method: test
breaks_if_removed: "Early drains shrink the set under review and notes leave the retro unseen."
refines:
  - uc-drain-the-inbox
source_refs:
  - uc-drain-the-inbox step 1
priority: should
---
