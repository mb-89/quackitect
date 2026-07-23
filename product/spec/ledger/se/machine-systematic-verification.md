---
id: se.machine-systematic-verification
kind: machine_state
statement: The full battery runs mechanically - once, at the gate side, across all iterations.
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
machine: se.machine-systematic
state: verification
state_kind: work
filled_by: engine
command: npm --prefix product/deliverable run verify --loglevel=error
---

## Guidance
Engine-filled. The one place the full battery runs ([[meth-test-first]]). Failure opens the fallback into fix_findings - collect everything, fix in one pass, one confirm run. The command is this project's battery; a downstream project declares its own.
