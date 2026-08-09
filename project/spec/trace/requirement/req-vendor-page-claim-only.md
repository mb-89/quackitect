---
id: req-vendor-page-claim-only
type: "[[requirement]]"
statement: Where a source is a vendor's own page, the record shall mark the finding as a claimed feature and never as a quality judgment.
kind: functional
verify_method: inspection
breaks_if_removed: A vendor's marketing enters the record as a measured judgment.
breaks_how_badly: crippling
refines:
  - uc-research-and-record-an-answer
source_refs:
  - uc-research-and-record-an-answer ext 3a
priority: should
weighs_against:
  - req-finding-lands-as-reference >
---
