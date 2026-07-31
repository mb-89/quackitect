---
kind: matrix-row
name: build-steps
statement: "Build steps: the placeholder the seeded chunk machine fills - the real steps run here, in parallel where independent."
state_kind: work
filled_by: agent
depends_on:
  - observe-red
runs: build-chunks
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_run
  - se_lint
  - se_git
evidence:
  - name: build_record
    description: "the chunk machine's run: chunks filled, actors, the sub-record file"
major: full
minor: full
patch: tailored
product: full
specification: tailored
major_note: |
  Applies in full: the seeded chunk machine runs, parallel where
  independent, every fill recorded.
minor_note: |
  Applies in full: the seeded chunk machine runs here, parallel builders
  on independent chunks, every fill recorded with its actor.
patch_note: |
  The fix itself, as one chunk. Commits stay fine-grained; the walk is
  plain - no sub-machine runs.
product_note: |
  Standing obligation: the shipped code is the sum of recorded builds -
  every element's content entered through a walked chunk, at whatever
  column.
specification_note: |
  DOCUMENT FORM: the walked chunk record - fills, actors, the sub-record
  file - in the iteration archive. The commits are the fine grain; the
  record is the readable summary.
---

## Guidance

The placeholder between the red observation and verification: plan-build seeds the iteration's chunk drawing, and entering this state runs it - one state per chunk, parallel builders on independent chunks, every fill recorded with its actor. An unreplaced placeholder FAILS MECHANICALLY: the compiled machine refuses to serve this state plain when no drawing was seeded. Seed the drawing at plan-build, always.
