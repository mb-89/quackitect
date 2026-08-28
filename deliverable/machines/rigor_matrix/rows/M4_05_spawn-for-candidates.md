---
kind: matrix-row
name: spawn-for-candidates
statement: "Spawn the hands the candidates phase needs: a walker per branch where the space fans out."
state_kind: work
filled_by: agent
shared_guidance: spawn-hands
depends_on:
  - gate-requirements
motivation: The candidates phase decides what gets compared. A hand that enumerates the space and then scores it will score the option it already liked. The roster is what keeps the enumeration honest.
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
  FLOOR - applies in full. A major opens the space wide, so the walker needs
  the rung the milestone's own maximum names. This state starts the walker
  only — the candidates gate spawns a reviewer later, at the gate.
minor_note: |
  FLOOR - applies in full. A walker for the phase. A reviewer where the phase
  carries a gate.
patch_note: |
  FLOOR - never struck, and tailored to one line. A patch still gets a walker,
  because the reason for the roster is that one hand must not enumerate and
  score the same set, and that reason does not shrink with the change size.
product_note: |
  At product scale the space is wide and the candidates run as their own
  submachines. This is the phase that spends the most hands, and a researcher
  is usually earned where a candidate rests on prior art.
specification_note: |
  DOCUMENT FORM: the hands named for the candidates phase, rendered in the
  record's archive entry beside the set they evaluated.
---

## Guidance

WHAT THIS PHASE'S HANDS ARE FOR. The candidates phase derives the criteria,
partitions the functions and enumerates the space. The enumeration fans out
into a submachine per candidate, so this phase spends the most hands. A
RESEARCHER is earned where a candidate rests on prior art outside the tree.
