---
id: se.adr-grandfathers-historical
kind: decision
statement: Historical grandfathers become recorded decisions, not silent constants. Pre-i7 non-EARS statements keep an ears exempt marker citing THIS adr. Pre-i8 tests carry a tests_red exempt marker citing THIS adr. The testsRedSince constant and the forward-only-baseline file die. Retrofitting shipped statements was rejected, since it would be a wording avalanche over history with zero behavior value.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0011_geronticide
v1_type: adr
v1_adjudicated_by: human
v1_class: review
v1_killer: "false"
p3_note: needed for THIS migration
---

## Rationale (not load-bearing)
The decision IS the record. Every exemption now points here; an exemption without a citation fails test-grandfathers-decided.
