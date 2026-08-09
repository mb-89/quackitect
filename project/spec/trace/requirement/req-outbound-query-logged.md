---
id: req-outbound-query-logged
type: "[[requirement]]"
statement: When research runs outside the repo, the engine shall log every outbound query alongside a reference to what came back.
kind: functional
verify_method: test
breaks_if_removed: The search that shaped an answer is unrecoverable; the answer cannot be audited.
refines:
  - uc-research-and-record-an-answer
source_refs:
  - uc-research-and-record-an-answer step 2
  - ".se/req-mine-v2.md: Logging, observability and the retro"
priority: should
weighs_with: req-repo-search-carries-intent — both measure whether a query is recorded with what it was for
weighs_against:
  - req-missing-document-stops-the-walk >
---
