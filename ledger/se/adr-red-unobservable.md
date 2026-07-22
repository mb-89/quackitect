---
id: se.adr-red-unobservable
kind: decision
statement: A test whose red state was never observable records its exemption citing this decision instead of a red observation.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_decided_in: i0014_doc_review
v1_type: adr
v1_kind: architecture
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
Some behavior lands before its test's iteration composes, or a fixture defect masked the red; the red-observation ritual has nothing to observe. The tests_red marker stays mandatory and cites this decision, so the exemption remains a recorded, sweepable call (req-testsred-exempt). Grandfathered pre-mechanism tests keep citing adr-grandfathers-historical.
