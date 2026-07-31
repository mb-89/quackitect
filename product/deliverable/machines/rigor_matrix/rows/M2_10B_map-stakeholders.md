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
major: tailored
minor: inherit
patch: none
product: full
specification: full
major_note: |
  Inherit the map; re-check the TENSIONS against the change - an
  architectural move often shifts who pays and who gains. New roles and
  new tensions recorded; the rest stands by pointer.
minor_note: |
  INHERIT; add only a role the delta newly serves, with its tensions
  against the standing set. No new role is the normal outcome.
patch_note: |
  Does not apply. No new roles enter through a patch. STRIKE PROPOSAL -
  owner adjudicates.
product_note: |
  STANDING ARTIFACT: the stakeholder map by role with its tensions. At
  rest every requirement sources to a role that exists here.
specification_note: |
  DOCUMENT FORM: a derived TABLE - roles and tensions from stakeholder
  nodes and their edges. The book's fundamentals or design-input chapter
  holds it; requirements' source_refs point back here.
---

## Guidance

Per [[meth-stakeholder-analysis]]; the tensions per [[meth-stakeholder-tensions]]. Roles, never names. Stakeholders are nodes; the matrices surface them by edge filter; requirements will source to them at M3.
