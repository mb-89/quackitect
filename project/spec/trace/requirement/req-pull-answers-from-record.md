---
id: req-pull-answers-from-record
type: "[[requirement]]"
statement: "When a driver asks what to do, the engine shall answer from the walk's recorded position with one instruction carrying everything the step needs."
kind: functional
verify_method: test
breaks_if_removed: "The driver has to reconstruct where it stands and what it may use, which is the whole job the lane exists to remove."
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step step 1
  - ".se/req-mine-sebots.md: state — derived, append-only, on disk"
  - uc-take-a-step step 2
  - ".se/req-mine-sebots.md: rumination — the failure the machine exists to cage"
  - ".se/req-mine-v2.md: errors and refusals"
priority: must
---

## Detail

What the one answer carries:

- When the walk stands on a state whose work is open, the engine shall answer the pull with one packet carrying the state's guidance, the legal tool set, and the owed evidence form.
