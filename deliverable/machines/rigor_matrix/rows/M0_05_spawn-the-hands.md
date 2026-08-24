---
kind: matrix-row
name: spawn-the-hands
statement: "Spawn the hands this phase needs: the guide names them, the harness starts them, and the record hears about it."
state_kind: work
filled_by: agent
shared_guidance: spawn-hands
motivation: A record walked by one hand is a record where the same agent authors and blesses its own work. The roster exists to stop that, and a roster nobody spawns is a roster that does not exist.
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
  rung the milestone's own maximum names. This state starts the walker only —
  its own gate spawns a reviewer later, at the gate.
minor_note: |
  FLOOR - applies in full. A walker for the phase. A reviewer where the phase
  carries a gate.
patch_note: |
  FLOOR - never struck, and tailored to one line. A patch still gets a walker,
  because the reason for the roster is that one hand must not author and bless
  the same work, and that reason does not shrink with the change size.
product_note: |
  At product scale the phases are long and the hands are worth naming
  deliberately. This state still starts the walker only — a researcher is
  usually earned at whichever state does the actual research.
specification_note: |
  DOCUMENT FORM: the hands named per phase, rendered in the record's archive
  entry so a reader can see who walked which stretch.
---
