---
id: req-missing-document-stops-the-walk
type: "[[requirement]]"
statement: If a state owes a document that does not exist, then the engine shall stop the walk and name the missing document.
kind: functional
verify_method: test
verified_by:
  - "tests/rowreads.test.ts :: it rejects a well-shaped path with nothing behind it"
  - "tests/rowreads.test.ts :: it rejects the exact bare id that blocked the walk on 2026-08-06"
breaks_if_removed: The state opens without its method, and absence reads as nothing-owed.
breaks_how_badly: crippling
refines:
  - uc-be-handed-the-method
source_refs:
  - uc-be-handed-the-method ext 6a
priority: should
weighs_against:
  - req-instruction-names-its-source >
---
