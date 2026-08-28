---
kind: matrix-row
name: spawn-for-prototype
statement: "Spawn the hands the prototype phase needs: a walker per spike, because spikes run side by side."
state_kind: work
filled_by: agent
shared_guidance: spawn-hands
depends_on:
  - gate-architecture
motivation: The prototype phase buys knowledge with time. A hand that ranked an unknown low will not run a hard spike against it. Spikes also run in parallel, and parallel work needs more than one hand.
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
  FLOOR - applies in full. A major carries the unknowns that most threaten the
  architecture, so the walker needs the rung the milestone's own maximum names.
  This state starts the walker only — the prototype gate spawns a reviewer later.
minor_note: |
  FLOOR - applies in full. A walker for the phase. A reviewer where the phase
  carries a gate.
patch_note: |
  FLOOR - never struck, and tailored to one line. A patch still gets a walker,
  because the reason for the roster is that one hand must not rank an unknown
  and then clear it, and that reason does not shrink with the change size.
product_note: |
  At product scale the spikes are many and independent. A walker per spike is
  the normal shape here, and a researcher is earned wherever a spike has to
  read the world rather than the tree.
specification_note: |
  DOCUMENT FORM: the hands named for the prototype phase, rendered in the
  record's archive entry beside the spikes they ran.
---

## Guidance

WHAT THIS PHASE'S HANDS ARE FOR. The prototype phase ranks the unknowns, runs
the spikes and folds the answers back. Spikes are independent and timeboxed, so
a walker per spike is the normal shape. A spike that reaches outside the
repository earns a RESEARCHER of its own.
