---
kind: matrix-row
name: plan-build
statement: "Plan the build: seed the iteration's chunk machine - small resumable chunks, dependencies as edges, realization kind per chunk."
state_kind: work
filled_by: agent
depends_on:
  - author-tests
entry_read:
  - project/deliverable/machines/methods/meth-build-strategies.md
seeds: build-chunks
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: build_machine
    description: "the seeded chunk drawing: chunks, dependencies, realization kinds"
  - name: promotions_placed
    description: promoted spike output positioned, or none
major: full
minor: full
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: the chunk machine seeded - chunks, dependency edges,
  realization kinds, promoted spikes placed.
minor_note: |
  Applies. The delta's build is chunked: small resumable chunks,
  dependency edges, realization kind each, promoted spikes as pre-verified
  chunks. A minor is exactly the size where an unplanned build starts
  sprawling.
patch_note: |
  Does not apply. A patch is one chunk by definition; no chunk machine is
  seeded. STRIKE PROPOSAL - owner adjudicates.

  ESCALATE: a fix that wants a build plan is not one chunk, and not a
  patch.
product_note: |
  Standing obligation: every build the product ever ran left its chunk
  record - the build history is reconstructable from the records, not
  from memory.
specification_note: |
  DOCUMENT FORM: the chunk drawing in the iteration record - chunks,
  edges, realization kinds. Archive material; the book does not teach
  build plans.
---

## Guidance

The build machine is seeded NOW. Only now is it known what will be built.

The plan carries:

- small resumable chunks
- dependency edges, parallel where independent, so chunks fan out to
  sub-agents
- iteration-unique ids
- one `realization: <kind>` per chunk

The guidance registry serves each builder its discipline's guidance and checks
([[meth-realization-guidance]]).

A promoted spike enters as a pre-verified starting chunk.

A monolithic build is lost on interruption. Small chunks make progress
durable.

Name the build STRATEGY with the plan ([[meth-build-strategies]]). The chosen
strategy orders the chunks.
