---
id: se.machine-systematic-gate-inputs
kind: machine_state
statement: "GATE inputs: did we understand the users - adjudicated against the M1 frame."
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
machine: se.machine-systematic
state: gate_inputs
state_kind: gate
filled_by: agent
---

## Guidance
The user-level picture stops here for judgment before any system-level writing starts - requirements written on unblessed stories propagate garbage. Review per [[meth-gate-review]].

## Evidence form
- props_realized | every value prop realized by at least one story | required
- stories_generalized | every story inside a use case | required
- roles_covered | no stakeholder role left out; tensions named | required
- excluded_stated | the binding excluded-use list exists | required
- examples_formulated | scenario paths and slides identified as the formulated examples | required
