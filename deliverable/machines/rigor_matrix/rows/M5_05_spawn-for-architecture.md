---
kind: matrix-row
name: spawn-for-architecture
statement: "Spawn the hand the architecture phase needs: the strongest walker in the record."
state_kind: work
filled_by: agent
shared_guidance: spawn-hands
depends_on:
  - gate-candidates
motivation: The architecture phase picks the winner every later phase is built on. One hand that argued for a candidate and then blesses it is not comparing anything. The roster is why the architecture gate means something.
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
  FLOOR - applies in full. A major moves architecture, so the walker needs the
  rung the milestone's own maximum names. This is where the rung is highest.
  This state starts the walker only — the architecture gate spawns a reviewer later.
minor_note: |
  FLOOR - applies in full. A walker for the phase. A reviewer where the phase
  carries a gate.
patch_note: |
  FLOOR - never struck, and tailored to one line. A patch still gets a walker,
  because the reason for the roster is that one hand must not pick and bless
  the same winner, and that reason does not shrink with the change size.
product_note: |
  At product scale the architecture outlives everything built on it. Name the
  hands deliberately here above anywhere else, and give the gate a reviewer
  that took no side in the convergence.
specification_note: |
  DOCUMENT FORM: the hands named for the architecture phase, rendered in the
  record's archive entry beside the decisions they recorded.
---

## Guidance

WHAT THIS PHASE'S HANDS ARE FOR. The architecture phase converges on a winner,
records the decisions and decomposes the structure. The rung is highest here,
because a wrong call costs the whole build. The REVIEWER at the architecture
gate matters most, and it must not have argued for the winner.
