---
id: req-a-persons-tick-is-proof
type: "[[requirement]]"
statement: "Where the reader is a person, the engine shall accept a tick on the reading surface as the document's proof."
kind: functional
verify_method: demonstration
breaks_if_removed: "A person is asked to type tail words like an agent, and the reading loop is unusable by hand."
refines:
  - uc-be-handed-the-method
source_refs:
  - uc-be-handed-the-method ext 4b
priority: should
---

## Detail

## Detail

- Editing a ticked document clears its tick, and the document is owed again.
- The owed reading is openable by the person as one file.
