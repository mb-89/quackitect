---
id: se.machine-lean-declare-goal
kind: machine_state
statement: State what this iteration ships and why it is load-bearing.
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
machine: se.machine-lean
state: declare_goal
state_kind: work
filled_by: agent
---

## Guidance
One goal, one iteration. Name the failure the work is load-bearing for (the v2 test). Then name the exit check: how will close_iteration know the goal happened? Record the rigor and that the iteration is not to market unless the owner explicitly says so.

## Evidence form
- goal | one line: what ships | required
- load_bearing_for | the named failure this addresses | required
- exit_check | how close will verify it | required
