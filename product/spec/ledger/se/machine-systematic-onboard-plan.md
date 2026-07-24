---
id: se.machine-systematic-onboard-plan
kind: machine_state
statement: "Confirm the iteration plan with the owner: what this iteration pulls in, what stays out."
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
machine: se.machine-systematic
state: onboard_plan
state_kind: work
filled_by: agent
---

## Guidance
Walk the planned entry beside everything the retro surfaced: drained notes, backlog items, field feedback. Things that belong together ride together. Small tool or infra work folds into the active iteration - never a dedicated tooling iteration for it. Propose the resulting scope as two lists, pulled-in and left-out, and put it to the owner. Collect, propose, wait - the confirmation is adjudicated at [[machine-systematic-gate-kickoff]].

## Evidence form
- goal | the confirmed one-line iteration goal | required
- pulled_in | what this iteration absorbs, each item with its origin | required
- left_out | what explicitly stays out, and where it went instead | required
