---
id: req-one-document-per-reply
type: "[[requirement]]"
statement: "When a document is owed, the engine shall serve one document per reply, with the engine's aggregate reading file counting as one served reply."
kind: functional
verify_method: test
breaks_if_removed: "A batched reply grows past what the host survives, and truncation eats documents mid-hand."
refines:
  - uc-be-handed-the-method
source_refs:
  - uc-be-handed-the-method step 2
  - uc-be-handed-the-method ext 2a
priority: should
---

## Detail

## Detail

- The document's full text rides in the reply body, never a path for the reader to fetch.
- One document at a time keeps every reply small enough to survive a truncating host.
