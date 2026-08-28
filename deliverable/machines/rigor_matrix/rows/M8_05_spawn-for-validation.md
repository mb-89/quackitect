---
kind: matrix-row
name: spawn-for-validation
statement: "Spawn the hand the validation phase needs: a walker for the evidence."
state_kind: work
filled_by: agent
shared_guidance: spawn-hands
depends_on:
  - gate-implementation
motivation: The validation phase asks whether the thing convinces anyone. A hand that built it already believes it. The roster is what puts a fresh reader in front of the evidence.
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
major_complexity: C2/R2
minor: full
minor_complexity: C2/R2
patch: full
patch_complexity: C2/R2
product: full
product_complexity: C2/R2
specification: tailored
major_note: |
  FLOOR - applies in full. A major has to show the stories still land, so the
  walker needs the rung the milestone's own maximum names. This state starts
  the walker only — the validation gate spawns a reviewer later.
minor_note: |
  FLOOR - applies in full. A walker for the evidence. A reviewer where the
  phase carries a gate.
patch_note: |
  FLOOR - never struck, and tailored to one line. A patch still gets a walker,
  because the reason for the roster is that one hand must not fill the evidence
  and judge it, and that reason does not shrink with the change size.
product_note: |
  At product scale the demo set is large and the consistency sweep is real
  work. This state still starts the walker only — the validation gate's
  reviewer stands in for the reader who was never in the room, spawned fresh
  there.
specification_note: |
  DOCUMENT FORM: the hands named for the validation phase, rendered in the
  record's archive entry beside the demos they ran.
---

## Guidance

WHAT THIS PHASE'S HANDS ARE FOR. The validation phase fills the story evidence,
runs the demos and sweeps for consistency. A REVIEWER here asks whether the
evidence convinces somebody who did not build the thing. The walker that built
it cannot answer that question about itself.
