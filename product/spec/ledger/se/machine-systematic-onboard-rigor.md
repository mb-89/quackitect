---
id: se.machine-systematic-onboard-rigor
kind: machine_state
statement: Check the selected rigor fits the iteration's size; recommend the prune-down when it does not.
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
machine: se.machine-systematic
state: onboard_rigor
state_kind: work
filled_by: agent
---

## Guidance
Rigor is a fit question, asked fresh every iteration. Systematic is the drawn machine; lean is derived from it as a strike-list ([[planning]]). For small, well-understood work, recommend the prune-down explicitly - running full systematic on a one-day fix is its own kind of waste. Name the states the strike would remove and what protection is lost with each. Never strike silently: the recommendation with its reasoning goes to the owner at [[machine-systematic-gate-kickoff]].

## Evidence form
- rigor_choice | the recommended rigor for this iteration, with the reasoning | required
- strikes | the states a prune-down would strike, each with the lost protection | optional
