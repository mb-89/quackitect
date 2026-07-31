---
kind: matrix-row
name: record-adrs
statement: Record the deciding ADRs, each addressing the requirements it shapes.
state_kind: work
filled_by: agent
depends_on:
  - reverse-sensitivity
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
  - name: adrs
    description: "the decision records, each traced"
---

## Guidance

The why lives once, here. Every decision is its OWN FILE (kind: decision - id, one-line decision, status, the addresses edge to the requirement or risk that forced it; the body holds context, options and consequences). The RAID register view includes the decisions beside the risks and assumptions ([[meth-raid]]) - one surface to read, files apart underneath. The rejected options stay recorded as history.
