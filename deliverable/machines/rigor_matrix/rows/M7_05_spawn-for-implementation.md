---
kind: matrix-row
name: spawn-for-implementation
statement: "Spawn the hand the implementation phase needs: a walker for the build."
state_kind: work
filled_by: agent
shared_guidance: spawn-hands
depends_on:
  - gate-prototype
motivation: The implementation phase is where the code gets written. A hand that wrote the code and then verifies it is reviewing its own reasoning. The roster is the whole reason verification is worth running.
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
  FLOOR - applies in full. A major builds against moved architecture, so the
  walker needs the rung the milestone's own maximum names. This state starts
  the walker only — the implementation gate spawns a reviewer later.
minor_note: |
  FLOOR - applies in full. A walker for the build. A reviewer for verification,
  and again where the phase carries a gate.
patch_note: |
  FLOOR - never struck, and tailored to one line. A patch still gets a walker,
  because the reason for the roster is that one hand must not build and verify
  the same code, and that reason does not shrink with the change size.
product_note: |
  At product scale the build is long and the verification is the phase that
  earns its keep. Give verification a reviewer that has read nothing of the
  build's reasoning.
specification_note: |
  DOCUMENT FORM: the hands named for the implementation phase, rendered in the
  record's archive entry beside the steps they built.
---

## Guidance

WHAT THIS PHASE'S HANDS ARE FOR. The implementation phase authors the tests,
builds the steps and runs verification. Verification's fresh eyes ARE a
REVIEWER, and it must not be the hand that wrote the code. That is the
strictest separation the matrix asks for anywhere.
