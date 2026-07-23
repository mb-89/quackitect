---
id: se.machine-systematic-plan-build
kind: machine_state
statement: "Plan the build: seed the iteration's chunk machine - small resumable chunks, dependencies as edges, realization kind per chunk."
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
machine: se.machine-systematic
state: plan_build
state_kind: work
filled_by: agent
submachine: iteration
---

## Guidance
The build machine is seeded NOW - only now is it known what will be built. Small resumable chunks, dependency edges (parallel where independent - chunks fan out to sub-agents), iteration-unique ids, and one `realization: <kind>` per chunk - the guidance registry serves each builder its discipline's guidance and checks ([[meth-realization-guidance]]). A promoted spike enters as a pre-verified starting chunk. A monolithic build is lost on interruption; small chunks make progress durable.

## Evidence form
- build_machine | the seeded chunk drawing: chunks, dependencies, realization kinds | required
- promotions_placed | promoted spike output positioned, or none | required
