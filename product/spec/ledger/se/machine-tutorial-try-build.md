---
id: se.machine-tutorial-try-build
kind: machine_state
statement: "An engine-filled state: the declared command runs mechanically."
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
machine: se.machine-tutorial
state: try_build
state_kind: work
filled_by: engine
command: node -e "process.exit(0)"
---

## Guidance
The engine runs the command itself and pins the result as evidence - zero model turns. Success takes the normal edge; failure opens the fallback and error edges.
