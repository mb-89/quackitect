---
id: se.machine-systematic-verify
kind: machine_state
statement: The declared check runs mechanically.
provenance:
  iteration: i2f-machines-are-canvases
  ai_involvement: agent-drafted
machine: se.machine-systematic
state: verify
state_kind: work
filled_by: engine
command: npm --prefix product/deliverable run verify --loglevel=error
---

## Guidance
Engine-filled: the command declared on this state runs through the se.run capture lane; the result lands as evidence with zero model turns. A failing command is a normal Failed - the fallback edge reopens do_work.
