---
id: req-wrong-proof-credits-nothing
type: "[[requirement]]"
statement: "If the returned proof does not match the delivered document, then the engine shall credit nothing and serve the same document again."
kind: functional
verify_method: test
breaks_if_removed: "A guessed proof credits a document never read, and the state opens on a hollow guarantee."
refines:
  - uc-be-handed-the-method
source_refs:
  - uc-be-handed-the-method step 4
  - uc-be-handed-the-method ext 4a
priority: must
---
