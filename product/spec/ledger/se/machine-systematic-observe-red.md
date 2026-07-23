---
id: se.machine-systematic-observe-red
kind: machine_state
statement: "Observe RED: every new check runs and fails before the build."
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
machine: se.machine-systematic
state: observe_red
state_kind: work
filled_by: agent
---

## Guidance
Last before the build, before any code lands ([[meth-test-first]]). A check green with no realized design is suspect. Record each observed failure; the mechanical observe-red lane takes this over when the executor upgrade lands.

## Evidence form
- red_observed | every new check with its observed failure | required
