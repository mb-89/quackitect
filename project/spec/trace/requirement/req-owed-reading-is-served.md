---
minted_in: i1
id: req-owed-reading-is-served
type: "[[requirement]]"
statement: When a state owes reading, the engine shall name and serve every owed document without a path from the reader.
kind: functional
verify_method: test
breaks_if_removed: The reader works out what it owes, and a skipped document is invisible until the work built on it fails.
breaks_how_badly: crippling
refines:
  - uc-be-handed-the-method
source_refs:
  - uc-be-handed-the-method step 1
  - uc-be-handed-the-method step 5
  - uc-be-handed-the-method step 2
  - uc-be-handed-the-method ext 2a
priority: must
---

## Detail

How the serving runs:

- When a document is owed, the engine shall serve one document per reply, with the engine's aggregate reading file counting as one served reply.
