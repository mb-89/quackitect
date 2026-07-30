---
kind: matrix-row
name: plan-build
statement: "Plan the build: seed the iteration's chunk machine - small resumable chunks, dependencies as edges, realization kind per chunk."
state_kind: work
filled_by: agent
depends_on:
  - author-tests
seeds: build-chunks
COMMENT: 'state: ok. not sure if mentioned: there are probably strategies here, like: build spines first, get to "breakthrough" early, "get it to run first, improve later", stuff like this.'
---

## Guidance

The build machine is seeded NOW - only now is it known what will be built. Small resumable chunks, dependency edges (parallel where independent - chunks fan out to sub-agents), iteration-unique ids, and one `realization: <kind>` per chunk - the guidance registry serves each builder its discipline's guidance and checks ([[meth-realization-guidance]]). A promoted spike enters as a pre-verified starting chunk. A monolithic build is lost on interruption; small chunks make progress durable.

## Evidence form

- build_machine | the seeded chunk drawing: chunks, dependencies, realization kinds | required
- promotions_placed | promoted spike output positioned, or none | required
