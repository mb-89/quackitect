---
kind: matrix-row
name: gate-inputs
statement: "GATE inputs: did we understand the users - adjudicated against the M1 frame."
state_kind: gate
filled_by: agent
depends_on:
  - draw-context
  - map-stakeholders
  - generalize-use-cases
COMMENT: "state: ok"
---

## Guidance

The user-level picture stops here for judgment before any system-level writing starts - requirements written on unblessed stories propagate garbage. Review per [[meth-gate-review]].

## Evidence form

- props_realized | every value prop realized by at least one story | required
- stories_generalized | every story inside a use case | required
- roles_covered | no stakeholder role left out; tensions named | required
- excluded_stated | the binding excluded-use list exists | required
- examples_formulated | scenario paths and slides identified as the formulated examples | required
