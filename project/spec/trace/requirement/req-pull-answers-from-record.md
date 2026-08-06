---
id: req-pull-answers-from-record
type: "[[requirement]]"
statement: "When a driver asks what to do, the engine shall answer from the walk's recorded position with exactly one instruction naming where the walk stands."
kind: functional
verify_method: test
breaks_if_removed: "Position lives in the agent's head; a fresh session cannot resume from disk."
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step step 1
  - ".se/req-mine-sebots.md: state — derived, append-only, on disk"
priority: must
---
