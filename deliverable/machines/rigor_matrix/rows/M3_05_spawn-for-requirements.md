---
kind: matrix-row
name: spawn-for-requirements
statement: "Spawn the hand the requirements phase needs: a walker for the writing."
state_kind: work
filled_by: agent
shared_guidance: spawn-hands
depends_on:
  - gate-inputs
motivation: The requirements phase fixes what the thing must do. A hand that writes a requirement and then declares it testable has checked nothing. The roster is what separates the writing from the checking.
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
major_complexity: C2/R1
minor: full
minor_complexity: C2/R1
patch: full
patch_complexity: C2/R1
product: full
product_complexity: C2/R1
specification: tailored
major_note: |
  FLOOR - applies in full. A major rewrites requirements the whole build rests
  on, so the walker needs the rung the milestone's own maximum names. This
  state starts the walker only — the requirements gate spawns a reviewer later.
minor_note: |
  FLOOR - applies in full. A walker for the phase. A reviewer where the phase
  carries a gate.
patch_note: |
  FLOOR - never struck, and tailored to one line. A patch still gets a walker,
  because the reason for the roster is that one hand must not author and bless
  the same requirement, and that reason does not shrink with the change size.
product_note: |
  At product scale the requirement set is long-lived and the assumptions under
  it are many. This state still starts the walker only — a researcher is
  usually earned wherever probing an assumption reaches outside the
  repository.
specification_note: |
  DOCUMENT FORM: the hands named for the requirements phase, rendered in the
  record's archive entry beside the requirements they wrote.
---

## Guidance

WHAT THIS PHASE'S HANDS ARE FOR. The requirements phase writes the
requirements, derives the functions and hunts the assumptions. Probing an
assumption often reaches outside the repository, so a RESEARCHER is frequently
earned. The REVIEWER at the requirements gate checks wording it did not write.
