---
kind: matrix-row
name: run-spikes
statement: "The placeholder the seeded spike machine fills - one timeboxed spike per chosen unknown, parallel."
state_kind: work
filled_by: agent
depends_on:
  - rank-unknowns
runs: spikes
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
evidence:
  - name: spike_records
    description: "each spike: its question, its timebox, its verdict - evidence, never opinion"
major: full
minor: tailored
patch: none
product: tailored
specification: tailored
major_note: |
  Applies in full: every seeded spike runs here, parallel, each within
  its timebox; the machine joins before the evidence folds back.
minor_note: |
  Runs whatever the tailored ranking seeded - often nothing: an explicit
  none in the drawing passes this state without ceremony.
patch_note: |
  Does not apply - rank-unknowns is struck at patch, so there is no
  drawing to run. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the spike records - question, timebox, verdict -
  retained with their iteration; RAID carries what stayed open.
specification_note: |
  DOCUMENT FORM: each spike record linked from the ranking table; the
  book carries the fold-back's outcome, never the runs themselves.
---

## Guidance

rank-unknowns AUTHORS the spike drawing (machines/spikes.md); entering this state RUNS it - one state per spike, parallel, each within its timebox ([[meth-spike-tracer]]). Zero spikes is a NORMAL outcome: a drawing carrying an explicit none with its reason passes this state without ceremony. An absent drawing refuses mechanically.
