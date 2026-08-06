---
id: req-proof-is-the-documents-tail
type: "[[requirement]]"
statement: "When a document is delivered, the engine shall name as its proof the words following a phrase near the document's end."
kind: functional
verify_method: test
breaks_if_removed: "Truncation drops the end, and a reader holding half a document can still produce the proof."
refines:
  - uc-be-handed-the-method
source_refs:
  - uc-be-handed-the-method step 3
  - uc-be-handed-the-method ext 2a
priority: must
---
