---
id: req-illegal-tool-refused
type: "[[requirement]]"
statement: "If a call reaches for a tool outside the state's legal set, then the engine shall refuse the call and leave the project unchanged."
kind: functional
verify_method: test
breaks_if_removed: "Work happens outside the lane, and the log no longer carries the whole story."
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step step 3
  - uc-take-a-step ext 3a
  - ".se/req-mine-v1.md: the lane — mediated I/O"
priority: must
---
