---
minted_in: i1
id: req-reading-proof
type: "[[requirement]]"
statement: When a document is delivered, the engine shall credit it only against a proof that the whole document arrived.
kind: functional
verify_method: test
breaks_if_removed: A reader claims the reading it never received, and every state below opens on guidance nobody read.
breaks_how_badly: fatal
refines:
  - uc-be-handed-the-method
source_refs:
  - uc-be-handed-the-method step 3
  - uc-be-handed-the-method ext 2a
  - uc-be-handed-the-method step 4
  - uc-be-handed-the-method ext 4a
  - uc-be-handed-the-method ext 4b
priority: must
---

## Detail

What counts as proof, per reader:

- When a document is delivered, the engine shall name as its proof the words following a phrase near the document's end.
- If the returned proof does not match the delivered document, then the engine shall credit nothing and serve the same document again.
- Where the reader is a person, the engine shall accept a tick on the reading surface as the document's proof.
