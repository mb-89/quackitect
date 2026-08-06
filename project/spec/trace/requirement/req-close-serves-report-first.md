---
id: req-close-serves-report-first
type: "[[requirement]]"
statement: "When a close is requested on a record, the engine shall serve the record's findings report before the close proceeds."
kind: functional
verify_method: test
breaks_if_removed: "The close proceeds blind, findings surface only if someone remembers to look, and the ruling step has nothing to rule from."
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record step 1
  - uc-close-a-record step 2
priority: should
---
