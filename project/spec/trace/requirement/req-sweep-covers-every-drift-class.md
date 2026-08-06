---
id: req-sweep-covers-every-drift-class
type: "[[requirement]]"
statement: When the sweep runs, the engine shall check every drift class in the Detail table and report findings for each class.
kind: functional
verify_method: test
breaks_if_removed: The sweep checks what is convenient; a skipped drift class drifts unbounded.
refines:
  - uc-let-the-system-catch-up
source_refs:
  - uc-let-the-system-catch-up step 2
priority: should
---

## Detail

## Detail

| drift class | checked against |
| --- | --- |
| guidance | its own rules |
| prose | the voice rules |
| minted artifacts | the templates that minted them |

A class the sweep cannot check reports itself unchecked rather than passing in silence.
