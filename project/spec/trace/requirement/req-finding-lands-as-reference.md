---
id: req-finding-lands-as-reference
type: "[[requirement]]"
statement: "When a research question settles, the product shall record the surviving finding as a reference node in the trace corpus."
kind: functional
verify_method: inspection
breaks_if_removed: "The next session runs the same search again; findings die in chat."
refines:
  - uc-research-and-record-an-answer
source_refs:
  - uc-research-and-record-an-answer step 4
  - ".se/req-mine-sebots.md: Capture, decisions, change"
priority: should
---
