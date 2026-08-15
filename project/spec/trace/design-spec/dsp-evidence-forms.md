---
minted_in: i1
id: dsp-evidence-forms
type: "[[design-spec]]"
statement: evidence forms built from state declarations and checked at every save, carried by one form model over markdown sections
realizes:
  - "el-walk-engine"
files:
  - "project/deliverable/engine/stateform.ts"
  - "project/deliverable/engine/forms.ts"
---

## Responsibility

The form a state owes is derived from its declaration: fields, live
sources, templates and checks. The same checks run at save, at submit
and over stored evidence, so a signed claim that stops holding turns
grey. The per-state laws live here too — coverage, the spec laws, the
observation checklists.

## Behavior and constraints

- A live source resolves at serve time and freezes on a signed form.
- Bound fields rebuild from trace nodes on every look; a cell write
  lands on the node it names.
- A derived field is a reading, never a claim: nothing stored, nothing
  demanded.
