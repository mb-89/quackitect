---
id: se.machine-tutorial-decide
kind: machine_state
statement: "A gate: the machine stops until a human blesses."
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
machine: se.machine-tutorial
state: decide
state_kind: gate
filled_by: agent
---

## Guidance
Submit creates an offer; the bless arrives through a channel the agent does not control (board, console, chat). The approval edge fires on the bless.

## Evidence form
- choice | which way the adjudicator sent you | required
