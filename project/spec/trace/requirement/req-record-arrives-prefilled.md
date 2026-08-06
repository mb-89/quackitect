---
id: req-record-arrives-prefilled
type: "[[requirement]]"
statement: When the person chooses a vehicle, the desk shall seed the record with every field carrying a proposed value drawn from the person's words, so that the person confirms rather than composes.
kind: functional
verify_method: inspection
breaks_if_removed: The person composes the record field by field and confirm-not-compose becomes a lie.
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed step 6
  - ".se/req-mine-v1.md: provenance and trust (mint prefill)"
  - ".se/req-mine-v1.md: the lane — mediated I/O (deterministic mint)"
priority: should
---
