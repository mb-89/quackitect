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

The placeholder between the red observation and verification.

specify-build seeds the iteration's chunk drawing, and entering this state runs
it. One state per chunk, with parallel builders on independent chunks, and
every fill recorded with its actor.

An unreplaced placeholder FAILS MECHANICALLY. The compiled machine refuses to
serve this state plain when no drawing was seeded.

Seed the drawing at specify-build, always.

M7 IS ALREADY A CHAIN: author-tests, then specify-build, then observe-red,
then this row. Each link is a real precedence, and specify-build sits inside
it rather than beside it.

SO A SKIPPED BUILD IS NOT A MISSING EDGE. On 2026-08-13 i3 walked from
author-tests into an empty placeholder without ever visiting specify-build,
while this chain stood exactly as written. Adding a second edge only made a
cycle, and the compiler said so.

The defect is in how the walk ENFORCES this precedence, not in whether the
precedence is declared.
