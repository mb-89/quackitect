---
kind: matrix-row
name: ship-review
statement: "The ship review: dependency flips, divergence flags, upstream proposals."
state_kind: work
filled_by: agent
depends_on:
  - package
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
  - se_git
evidence:
  - name: review
    description: "the dependency list with rulings; new asks answered"
  - name: upstream
    description: "proposals deposited, or none owed"
---

## Guidance

Per [[meth-dependency-ship-review]]: display everything, ask only where no sticky ruling exists or the state changed; diverged deps ship flagged; upstream offers deposited, never pushed.
