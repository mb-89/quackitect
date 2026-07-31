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
---

## Guidance

rank-unknowns AUTHORS the spike drawing (machines/spikes.md); entering this state RUNS it - one state per spike, parallel, each within its timebox ([[meth-spike-tracer]]). Zero spikes is a NORMAL outcome: a drawing carrying an explicit none with its reason passes this state without ceremony. An absent drawing refuses mechanically.
