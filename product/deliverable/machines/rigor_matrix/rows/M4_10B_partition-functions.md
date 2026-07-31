---
kind: matrix-row
name: partition-functions
statement: "Partition the functions: the shared function DSM before any enumeration."
state_kind: work
filled_by: agent
depends_on:
  - gate-requirements
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
  - name: partitioning
    description: "the clustered function DSM: relation meaning, coupling reasons, clusters"
---

## Guidance

Per [[meth-function-dsm]]: one relation meaning per matrix, coupling reasons classified, clusters formed, qualities assigned (basic / additional / safety / support). This partitioning is SHARED across all candidates - the static cut into elements varies per candidate later. The matrix is a projection over the function notes' edges.
