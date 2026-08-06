---
id: req-report-lists-every-finding
type: "[[requirement]]"
statement: "The engine shall list, in the close-time findings report, every finding the record produced, with zero dropped."
kind: functional
verify_method: test
breaks_if_removed: "A finding missing from the report is never ruled, and the close guarantee that every finding is ruled silently lies."
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record step 2
  - uc-close-a-record step 3
priority: must
---
