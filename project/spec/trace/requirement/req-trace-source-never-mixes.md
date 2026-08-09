---
id: req-trace-source-never-mixes
type: "[[requirement]]"
statement: While the corpus is split across the trunk and an open record, the engine shall resolve each trace view against its selected source alone, mixing zero trunk content into the open record's view.
kind: functional
verify_method: test
breaks_if_removed: An open record's half-made trace mixes with trunk truth; the reader cannot tell which world they read.
refines:
  - uc-trace-a-decision-to-its-origin
source_refs:
  - uc-trace-a-decision-to-its-origin ext 1a
priority: should
weighs_against:
  - req-broken-trace-is-a-defect >
---
