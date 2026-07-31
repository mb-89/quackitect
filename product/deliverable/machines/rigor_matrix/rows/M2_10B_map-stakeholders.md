---
kind: matrix-row
name: map-stakeholders
statement: Map the stakeholders by role, and surface their tensions.
state_kind: work
filled_by: agent
depends_on:
  - gate-motivation
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
  - name: roles
    description: "every role, one line each"
  - name: tensions
    description: "the conflicting pairs with their reasoning, or none-found stated"
---

## Guidance

Per [[meth-stakeholder-analysis]]; the tensions per [[meth-stakeholder-tensions]]. Roles, never names. Stakeholders are nodes; the matrices surface them by edge filter; requirements will source to them at M3.
