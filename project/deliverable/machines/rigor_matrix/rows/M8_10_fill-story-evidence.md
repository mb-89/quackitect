---
kind: matrix-row
name: fill-story-evidence
statement: "Fill the stories: every slide's evidence side, all stories, all iterations - and author the demo drawing for the must stories."
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
major: full
minor: tailored
patch: tailored
product: full
specification: full
major_note: |
  Applies in full: every story the change created or touched fills its
  evidence sides against the pass lines; the demo drawing is authored
  with one step per must story. Stories the architectural move
  invalidated were revised at M2 - their evidence fills against the
  revision.
minor_note: |
  The delta's stories fill their evidence sides against their pass lines.
  New must stories join the demo drawing. Resident stories stand unless
  the delta's behavior touched them - those refresh.
patch_note: |
  One narrow duty: where the fixed behavior is the EVIDENCE of an
  existing story slide, refresh that slide's evidence. No demo drawing
  is authored. Nothing else fills.
product_note: |
  STANDING ARTIFACT: the filled stories - the product's validation record
  at rest. Every slide's evidence reaches the shipped system; converted
  acceptance scenarios run in the battery.
specification_note: |
  DOCUMENT FORM: the story decks' evidence sides filled with references
  into the shipped system. The validation chapter renders the must
  stories with their evidence.
---

## Guidance

Per [[meth-validation-container]]: walk every story - this iteration's and every earlier one's - and fill each slide's evidence half from the shipped system. A slide that cannot fill is a finding.

THE CHECK IS COMPUTED, so this state carries no form. The law reads every story deck and refuses while any slide's evidence half is empty; the refusal lists the unfilled stories. Signing is a bare submit.

THE MUST STORIES ARE THE EXCEPTION here: their evidence is the demonstration report, and run-demos mints those next. The law skips them at this state and catches them at the gate.

AUTHOR THE DEMO DRAWING before leaving: `<record>/machines/demos.md`, in the record’s own folder, one step per must story, the step id being the story id. run-demos runs it.
