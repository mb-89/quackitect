---
kind: matrix-row
name: map-stakeholders
statement: "Map the stakeholders by role: who the value props serve, and who else the project answers to."
state_kind: work
filled_by: agent
depends_on:
  - gate-motivation
entry_read:
  - project/deliverable/machines/methods/meth-stakeholder-analysis.md
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
    template: refs
    of: stakeholder
    description: every role as a node reference, one per line — the node carries the placement, this field never restates it
  - name: coverage
    description: every value prop's audience resolves to a role here, and every always-on class is present or ruled out with its reason
major: tailored
minor: none
patch: none
product: full
specification: full
major_note: |
  Inherit the map; re-check it against the change. An architectural move
  often shifts who pays and who gains, and a role that newly loses gets
  its disposition re-marked. New roles recorded; the rest stands by
  pointer.
minor_note: |
  Does not apply (owner ruling 2026-08-13). The stakeholder set stands at
  this size, so the state could only ever answer "unchanged".

  ESCALATE: a new stakeholder brings a new value proposition with it, and
  that is major territory.
patch_note: |
  Does not apply. No new roles enter through a patch. STRIKE PROPOSAL -
  owner adjudicates.
product_note: |
  STANDING ARTIFACT: the stakeholder set by role, each node carrying its
  placement and its disposition. At rest every requirement sources to a
  role that exists here.
specification_note: |
  DOCUMENT FORM: a derived TABLE. It carries the role and the type, then the interest, the influence and
  disposition, read off the stakeholder nodes. The Stakeholder/View
  matrix derives from the same nodes. The book's fundamentals or
  design-input chapter holds them; requirements' source_refs point back.
---

## Guidance

Per [[meth-stakeholder-analysis]]. Roles, never names.

START FROM THE VALUE PROPS. Each one names an `audience`, and that audience is a stakeholder. Sweep them first and ask who each proposition is for.

THEN THE ROLES THE PROPS DO NOT REACH. The always-on classes every project serves come next. After them come the roles the project and the organisation carry. Who funds it. Who must approve it. Who inherits it when this effort ends. Who is affected without ever being asked. None of these fall out of the value props, and they are the ones a walk misses.

SO THE ROLES ARE NODES, shaped by [[stakeholder]]. This field carries REFERENCES, never prose. The node holds the placement and the concerns; the form points at it and never restates it.

COVERAGE IS WHAT THIS STEP PROVES, and it is what the M2 gate reads. Every value prop's audience resolves. Every always-on class is present or ruled out with its reason. At M3 every requirement sources to a role that exists here.

TENSIONS ARE RAID ENTRIES (owner ruling 2026-08-06). Two roles pulling against each other is a risk with an owner and a trigger, logged in the register. It is not a field here.
