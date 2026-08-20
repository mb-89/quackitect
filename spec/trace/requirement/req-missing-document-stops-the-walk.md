---
minted_in: i1
id: req-missing-document-stops-the-walk
type: "[[requirement]]"
statement: If a state owes a document that does not exist, then the engine shall stop the walk and name the missing document.
kind: functional
verify_method: test
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
