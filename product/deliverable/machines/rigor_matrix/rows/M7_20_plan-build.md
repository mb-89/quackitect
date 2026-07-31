---
kind: matrix-row
name: plan-build
statement: "Plan the build: seed the iteration's chunk machine - small resumable chunks, dependencies as edges, realization kind per chunk."
state_kind: work
filled_by: agent
depends_on:
  - author-tests
seeds: build-chunks
evidence:
  - name: build_machine
    description: "the seeded chunk drawing: chunks, dependencies, realization kinds"
  - name: promotions_placed
    description: "promoted spike output positioned, or none"
---

## Guidance

The build machine is seeded NOW - only now is it known what will be built. Small resumable chunks, dependency edges (parallel where independent - chunks fan out to sub-agents), iteration-unique ids, and one `realization: <kind>` per chunk - the guidance registry serves each builder its discipline's guidance and checks ([[meth-realization-guidance]]). A promoted spike enters as a pre-verified starting chunk. A monolithic build is lost on interruption; small chunks make progress durable. Name the build STRATEGY with the plan ([[meth-build-strategies]]) - the chosen strategy orders the chunks.
