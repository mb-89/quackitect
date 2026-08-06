---
id: req-unsound-call-refused
type: "[[requirement]]"
statement: "If an admitted call fails its precondition, then the engine shall refuse the call and leave the project unchanged."
kind: functional
verify_method: test
breaks_if_removed: "A refused call still half-writes, and the tree stops matching what the log says happened."
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step step 3
  - uc-take-a-step ext 3a
  - ".se/req-mine-v1.md: the lane — mediated I/O"
  - "- \".se/req-mine-v2.md: the edit model and the file lane"
  - uc-take-a-step step 3
priority: must
---

## Detail

The preconditions, and what each refusal protects:

- If a call reaches for a tool outside the state's legal set, then the engine shall refuse the call and leave the project unchanged.
- If a write's base hash does not match the file on disk, then the engine shall refuse the write with zero bytes changed.
