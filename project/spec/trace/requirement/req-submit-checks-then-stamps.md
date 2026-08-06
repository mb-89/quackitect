---
id: req-submit-checks-then-stamps
type: "[[requirement]]"
statement: "When a filled form is returned, the engine shall check every field's shape and stamp the claim only where zero checks fail."
kind: functional
verify_method: test
breaks_if_removed: "Half-checked evidence is stamped as whole; an empty required field enters the record."
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step step 5
  - uc-take-a-step ext 5a
priority: must
---

## Detail

## Detail

| check outcome | result |
| --- | --- |
| every field passes | the claim is stamped, carrying the acting driver |
| a required field is empty | the answer names that field; nothing is stamped |
| a field fails its shape | the answer names that field; nothing is stamped |
| any failure | zero partial stamps |
