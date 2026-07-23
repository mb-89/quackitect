---
id: se.machine-systematic-probe-assumptions
kind: machine_state
statement: Field-probe every environment assumption a requirement builds on.
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
machine: se.machine-systematic
state: probe_assumptions
state_kind: work
filled_by: agent
---

## Guidance
One probe settles what a datasheet claims: check the real channel - what a harness actually loads, what an API actually returns, what the material actually measures. Probed assumptions update the RAID register ([[meth-raid]]).

## Evidence form
- probes | each assumption, its probe, its result | required
