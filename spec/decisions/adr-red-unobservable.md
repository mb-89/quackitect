---
id: adr-red-unobservable
decided_in: i0014_doc_review
type: adr
kind: architecture
adjudicated_by: user
statement: A test whose red state was never observable records its exemption citing this decision instead of a red observation.
class: review
killer: false
---
## Rationale (not load-bearing)
Some behavior lands before its test's iteration composes, or a fixture defect masked the red; the red-observation ritual has nothing to observe. The tests_red marker stays mandatory and cites this decision, so the exemption remains a recorded, sweepable call (req-testsred-exempt). Grandfathered pre-mechanism tests keep citing adr-grandfathers-historical.
