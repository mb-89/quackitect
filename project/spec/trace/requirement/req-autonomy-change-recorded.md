---
id: req-autonomy-change-recorded
type: "[[requirement]]"
statement: "When the autonomy setting changes, the engine shall record exactly one durable entry carrying the prior value, the new value, and the time of the change."
kind: functional
verify_method: test
breaks_if_removed: "Nobody can tell later how much autonomy stood granted when a step ran."
refines:
  - uc-set-the-autonomy
source_refs:
  - uc-set-the-autonomy step 2
  - ".se/req-mine-v1.md: the ledger and truth"
priority: should
---
