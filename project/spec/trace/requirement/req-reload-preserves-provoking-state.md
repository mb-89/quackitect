---
id: req-reload-preserves-provoking-state
type: "[[requirement]]"
statement: "When a reload is requested, the engine shall record the pre-reload state of every governed tree before it restarts."
kind: functional
verify_method: test
breaks_if_removed: "The walk that provoked the change vanishes at restart, so the record cannot show what the correction answered."
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - uc-change-the-method-mid-walk guarantee
  - ".se/req-mine-v1.md: the ledger and truth"
priority: should
---
