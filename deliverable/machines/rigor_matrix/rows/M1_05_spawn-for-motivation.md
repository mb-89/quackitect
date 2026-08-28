---
kind: matrix-row
name: spawn-for-motivation
statement: "Spawn the hand the motivation phase needs: a walker to frame it."
state_kind: work
filled_by: agent
shared_guidance: spawn-hands
depends_on:
  - gate-kickoff
motivation: The motivation phase decides why the work exists at all. One hand that drafts a vision and then pressure-tests it is grading its own framing. A separate hand is what makes the pressure test worth reading.
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
  FLOOR - applies in full. A major rewrites the motivation, so the walker needs
  the rung the milestone's own maximum names. This state starts the walker
  only — the motivation gate spawns a reviewer later, at the gate.
minor_note: |
  FLOOR - applies in full. A walker for the framing. A reviewer where the phase
  carries a gate.
patch_note: |
  FLOOR - never struck, and tailored to one line. A patch still gets a walker,
  because the reason for the roster is that one hand must not author and bless
  the same framing, and that reason does not shrink with the change size.
product_note: |
  At product scale the motivation outlives every iteration built on it. A
  state still starts the walker only — a researcher is usually earned for
  checking the as-is world, wherever that checking actually happens.
specification_note: |
  DOCUMENT FORM: the hands named for the motivation phase, rendered in the
  record's archive entry beside the vision they framed.
---

## Guidance

WHAT THIS PHASE'S HANDS ARE FOR. The motivation phase draws the vision, the
actual state, the delta and the non-goals. A RESEARCHER is often earned here,
because the as-is world sits outside the repository. The REVIEWER at the
motivation gate reads the framing without having written it.
