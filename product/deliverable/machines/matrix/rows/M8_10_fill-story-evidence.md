---
kind: matrix-row
statement: "Fill the stories: every slide's evidence side, all stories, all iterations - and seed the killer demonstrations."
state_kind: work
filled_by: agent
depends_on: [gate-implementation]
seeds: demos
---

## Guidance

Per [[meth-validation-container]]: walk every story against the pass lines; fill each slide's evidence_ref from the shipped system; a slide that cannot fill is a finding. This state SEEDS the demonstration machine: one parallel demo per killer use case, exercised for real. Executable slices convert to permanent acceptance scenarios.

## Evidence form

- slides_filled | the stories walked, evidence refs in place or findings named | required
- demos_seeded | one demonstration per killer use case | required
