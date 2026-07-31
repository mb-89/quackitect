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
evidence:
  - name: props_realized
    description: "every value prop realized by at least one story"
  - name: stories_generalized
    description: "every story inside a use case"
  - name: roles_covered
    description: "no stakeholder role left out; tensions named"
  - name: excluded_stated
    description: "the binding excluded-use list exists"
  - name: examples_formulated
    description: "scenario paths and slides identified as the formulated examples"
---

## Guidance

The user-level picture stops here for judgment before any system-level writing starts - requirements written on unblessed stories propagate garbage. Review per [[meth-gate-review]].
