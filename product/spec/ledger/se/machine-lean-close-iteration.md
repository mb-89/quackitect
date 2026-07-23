---
id: se.machine-lean-close-iteration
kind: machine_state
statement: The iteration closes against its declared goal.
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
machine: se.machine-lean
state: close_iteration
state_kind: gate
filled_by: agent
---

## Guidance
Compare the evidence against declare_goal's exit_check. Gates are adjudicated, never engine-blessed: mechanical states fill, never bless. The review follows [[meth-gate-review]].

## Evidence form
- exit_check_result | the declared exit check, and what it showed | required
