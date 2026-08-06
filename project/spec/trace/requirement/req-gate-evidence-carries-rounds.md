---
id: req-gate-evidence-carries-rounds
type: "[[requirement]]"
statement: "The engine shall carry each adjudication round as a distinct field on the gate's evidence form."
kind: functional
verify_method: inspection
breaks_if_removed: "The person cannot see what was verified, what was validated, or what the red team tried without excavating chat."
refines:
  - uc-adjudicate-a-gate
source_refs:
  - uc-adjudicate-a-gate step 3
priority: should
---

## Detail

## Detail

| round | carries |
| --- | --- |
| verification | what was checked against the demand, with results |
| validation | what was checked against the need, with results |
| red team | what was tried to kill the work, and what survived |
