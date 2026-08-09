---
id: req-repo-search-carries-intent
type: "[[requirement]]"
statement: The lane shall record every repo search in the call log with its stated intent.
kind: functional
verify_method: test
breaks_if_removed: A search leaves no record of why it ran; establishing that the repo lacks an answer leaves no trail.
breaks_how_badly: abrasive
refines:
  - uc-research-and-record-an-answer
source_refs:
  - uc-research-and-record-an-answer step 1
priority: should
---
