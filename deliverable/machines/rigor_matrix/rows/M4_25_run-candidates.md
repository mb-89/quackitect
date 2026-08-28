---
kind: matrix-row
name: run-candidates
statement: The placeholder the seeded candidate machine fills - one parallel compose state per shortlisted combination.
state_kind: work
filled_by: agent
depends_on:
  - enumerate-space
runs: candidates
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
  Applies in full: one compose state per shortlisted combination,
  parallel; the unchanged baseline enters each as a fixed block; the
  join hands the composed set to evaluate-set.
minor_note: |
  Does not apply - the architecture holds and enumerate-space is struck,
  so nothing is seeded to run. STRIKE PROPOSAL - owner adjudicates.
patch_note: |
  Does not apply - no design space opens for a behavior fix, so nothing
  is seeded to run. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the composed candidate records the chart's
  one-pagers are built from.
specification_note: |
  DOCUMENT FORM: rides enumerate-space's chapter - the one-pagers are
  this run's output; no separate section.
---

## Guidance

build-chart AUTHORS the candidate drawing (`<record>/machines/candidates.md`, in the record’s own folder), one compose state per line drawn on the chart. Entering this state RUNS it.

- One compose state per candidate.
- All of them in parallel.
- The unchanged baseline enters each as a fixed block.

An unseeded drawing refuses mechanically. Until build-chart has run there is nothing to enter, and the drawing cannot be double-clicked into.

IT WRITES BACK INTO THE CANDIDATE NOTES, and mints nothing. Each compose state fills three sections of the [[candidate]] note its line already created:

- How it works - the whole architecture, and especially the seams between the chosen options.
- What it costs - the rough feasibility checks, proportional and no more ([[meth-feasibility-checks]]).
- What it leans on - what has to be true for it to work.

THERE IS NO SECOND ARTIFACT. A composed record beside the candidate would be a second copy of one thing, and the two disagree the first time anybody edits one. The candidate item card says which state writes which section.

NO SPIKES HERE. The rough checks are M4's; the deep ones are M6's, on the winner alone. Running them per candidate spends the budget before anything is chosen.

JUDGING STAYS AT evaluate-set. Composing and evaluating never share a state, and cutting does not share one with either ([[meth-derive-criteria]]). An agent that knows the score while it writes the description writes a description that earns the score.
