---
kind: matrix-row
name: scope-non-goals
statement: Scope and non-goals, informed by the delta.
state_kind: work
filled_by: agent
depends_on:
  - frame-delta
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
  - name: scope
    description: "what this effort takes on"
  - name: non_goals
    description: "what it deliberately leaves, one line each"
---

## Guidance

The delta says what must close; scope says how much of it THIS effort takes on, and the non-goals say what it deliberately leaves. Vision-level here; the binding system-level exclusion list comes at draw-context (M2).
