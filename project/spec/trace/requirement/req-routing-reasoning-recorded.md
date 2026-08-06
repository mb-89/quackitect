---
id: req-routing-reasoning-recorded
type: "[[requirement]]"
statement: When work lands in a vehicle, the engine shall record the recommendation, the person's choice, and the reasoning on the record.
kind: functional
verify_method: inspection
breaks_if_removed: Nobody can later tell why this vehicle holds this work, and the choice is re-litigated.
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed guarantee
  - ".se/req-mine-sebots.md: capture, decisions, change (rejections need memory)"
priority: should
---
