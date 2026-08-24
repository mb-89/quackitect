---
kind: matrix-row
name: spawn-for-inputs
statement: "Spawn the hands the inputs phase needs: a walker for each of the three parallel rows."
state_kind: work
filled_by: agent
shared_guidance: spawn-hands
depends_on:
  - gate-motivation
motivation: The inputs phase decides whose problem this is. A hand that invents the stakeholders will find its own stories convincing. The roster puts the drawing and the checking in different heads.
exit_script:
  - deliverable/engine/bin/hands-spawned.ts
legal_tools:
  - se_run
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: hands
    description: which hand this phase starts, checked against the roster on [[meth-spawn-hands]]. Left blank where the record runs no walkers, which is the default
    required: false
    template: checklist
    items:
      - $spawn_hands
floor: true
major: full
minor: full
patch: full
product: full
specification: tailored
major_note: |
  FLOOR - applies in full. A major redraws the context, so the walker needs the
  rung the milestone's own maximum names. This state starts the walker only —
  the inputs gate spawns a reviewer later, at the gate.
minor_note: |
  FLOOR - applies in full. A walker for the phase. A reviewer where the phase
  carries a gate.
patch_note: |
  FLOOR - never struck, and tailored to one line. A patch still gets a walker,
  because the reason for the roster is that one hand must not author and bless
  the same stories, and that reason does not shrink with the change size.
product_note: |
  At product scale the stakeholder map is real work and rarely fits one head. A
  state still starts a walker per row only — a researcher is usually earned
  wherever a stakeholder or a neighbouring system must be found outside the
  repository.
specification_note: |
  DOCUMENT FORM: the hands named for the inputs phase, rendered in the record's
  archive entry beside the stories they gathered.
---

## Guidance

WHAT THIS PHASE'S HANDS ARE FOR. The inputs phase draws the context, maps the
stakeholders and writes the stories. Three rows run side by side here, so more
than one walker is the normal shape. A RESEARCHER is earned where a stakeholder
or a neighbouring system must be found outside the repository.
