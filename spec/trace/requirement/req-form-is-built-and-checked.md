---
minted_in: i1
id: req-form-is-built-and-checked
type: "[[requirement]]"
statement: When a state owes evidence, the engine shall build the form itself and shall stamp the returned claim only where every field's shape passes.
kind: functional
verify_method: test
breaks_if_removed: Forms drift per author and a claim stamps itself, so the evidence stops meaning one thing.
breaks_how_badly: fatal
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step step 4
  - ".se/req-mine-v1.md: the lane — mediated I/O"
  - uc-take-a-step ext 4a
  - uc-take-a-step step 5
  - uc-take-a-step ext 5a
priority: must
---

## Detail

The form's life, from build to stamp:

- When a state owes evidence, the engine shall build the evidence form itself and hand it over with every field named and typed.
- If a reference field's line names zero existing nodes, then the engine shall refuse the line and name the type's template in the refusal.
- When a filled form is returned, the engine shall check every field's shape and stamp the claim only where zero checks fail.
