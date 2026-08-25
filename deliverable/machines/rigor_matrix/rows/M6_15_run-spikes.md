---
kind: matrix-row
name: run-spikes
statement: The placeholder the seeded spike machine fills - one timeboxed spike per chosen unknown, parallel.
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
major: full
minor: none
patch: none
product: tailored
specification: tailored
major_note: |
  Applies in full: every seeded spike runs here, parallel, each within
  its timebox; the machine joins before the evidence folds back.
minor_note: |
  Does not apply. No spikes are seeded at this
  size, so there are none to run.

  ESCALATE: needing a spike is the tell that this is a major.
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

rank-unknowns AUTHORS the spike drawing (`<record>/machines/spikes.md`, in the record’s own folder). Entering this
state RUNS it.

One state per spike, in parallel, each within its timebox
([[meth-spike-tracer]]).

Zero spikes is a NORMAL outcome. A drawing carrying an explicit none with its
reason passes this state without ceremony.

An absent drawing refuses mechanically.
