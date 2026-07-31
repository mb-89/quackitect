---
kind: matrix-row
name: derive-functions
statement: Derive the solution-neutral function structure from the requirements.
state_kind: work
filled_by: agent
depends_on:
  - write-requirements
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
  - name: function_structure
    description: "overall function and sub-functions, solution-neutral"
  - name: coverage
    description: "every requirement mapped, every use-case step covered - the matrix filters show no holes"
---

## Guidance

Per [[meth-function-structures]]: requirements first, functions from them - the entry into concepting. Verb + noun, no technology named. Every requirement maps to at least one function (requires edge); every use-case step covered. The function structure is the feedstock of M4's partitioning.
