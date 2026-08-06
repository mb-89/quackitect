---
kind: matrix-row
name: fill-story-evidence
statement: "Fill the stories: every slide's evidence side, all stories, all iterations - and seed the killer demonstrations."
state_kind: work
filled_by: agent
depends_on:
  - gate-implementation
seeds: demos
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
  - name: slides_filled
    description: the stories walked, evidence refs in place or findings named
  - name: demos_seeded
    description: one demonstration per killer use case
major: full
minor: tailored
patch: tailored
product: full
specification: full
major_note: |
  Applies in full: every story the change created or touched fills its
  evidence sides against the pass lines; demos seeded for the killer use
  cases. Stories the architectural move invalidated were revised at M2 -
  their evidence fills against the revision.
minor_note: |
  The delta's stories fill their evidence sides against their pass lines.
  Killer use cases among the NEW stories get their demos seeded. Resident
  stories stand unless the delta's behavior touched them - those refresh.
patch_note: |
  One narrow duty: where the fixed behavior is the EVIDENCE of an existing
  story slide, refresh that slide's evidence_ref. No demo machine is
  seeded. Nothing else fills.
product_note: |
  STANDING ARTIFACT: the filled stories - the product's validation record
  at rest. Every slide's evidence_ref reaches the shipped system; the
  acceptance scenarios run in the battery.
specification_note: |
  DOCUMENT FORM: the story decks' evidence sides filled with
  evidence_refs into the shipped system. The validation chapter renders
  the killer stories with their evidence; converted acceptance scenarios
  appear in the verification chapter's derived table.
---

## Guidance

Per [[meth-validation-container]]: walk every story against the pass lines; fill each slide's evidence_ref from the shipped system; a slide that cannot fill is a finding. This state SEEDS the demonstration machine: one parallel demo per killer use case, exercised for real. Executable slices convert to permanent acceptance scenarios.
