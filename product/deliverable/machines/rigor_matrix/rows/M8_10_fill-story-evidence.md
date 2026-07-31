---
kind: matrix-row
name: fill-story-evidence
statement: "Fill the stories: every slide's evidence side, all stories, all iterations - and seed the killer demonstrations."
state_kind: work
filled_by: agent
depends_on:
  - gate-implementation
seeds: demos
evidence:
  - name: slides_filled
    description: "the stories walked, evidence refs in place or findings named"
  - name: demos_seeded
    description: "one demonstration per killer use case"
---

## Guidance

Per [[meth-validation-container]]: walk every story against the pass lines; fill each slide's evidence_ref from the shipped system; a slide that cannot fill is a finding. This state SEEDS the demonstration machine: one parallel demo per killer use case, exercised for real. Executable slices convert to permanent acceptance scenarios.
