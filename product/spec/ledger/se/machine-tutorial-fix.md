---
id: se.machine-tutorial-fix
kind: machine_state
statement: A repair stop on the fallback loop.
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
machine: se.machine-tutorial
state: fix
state_kind: work
filled_by: agent
---

## Guidance
The recovery edge leads back to the attempt. The guard on the fallback edge caps the loop; when it exhausts, the machine escapes and a human decides.

## Evidence form
- fixed | what was repaired | required
