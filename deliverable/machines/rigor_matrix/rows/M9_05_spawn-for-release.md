---
kind: matrix-row
name: spawn-for-release
statement: "Spawn the hand the release phase needs: a walker to package it."
state_kind: work
filled_by: agent
shared_guidance: spawn-hands
depends_on:
  - gate-validation
motivation: The release phase hands the artifact to a stranger. A hand that assembled the package already knows where everything is. The roster is what makes checking it by using it a real check.
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
  FLOOR - applies in full. A major ships a changed shape, so the walker needs
  the rung the milestone's own maximum names. This state starts the walker
  only — the release gate spawns a reviewer later.
minor_note: |
  FLOOR - applies in full. A walker for the packaging. A reviewer where the
  phase carries a gate.
patch_note: |
  FLOOR - never struck, and tailored to one line. A patch still gets a walker,
  because the reason for the roster is that one hand must not package and bless
  the same artifact, and that reason does not shrink with the change size.
product_note: |
  At product scale the package is what everyone else sees first. This state
  still starts the walker only — the release gate's reviewer is the only hand
  that can read the installer and the README without knowing what they were
  supposed to say.
specification_note: |
  DOCUMENT FORM: the hands named for the release phase, rendered in the
  record's archive entry beside the artifact they shipped.
---

## Guidance

WHAT THIS PHASE'S HANDS ARE FOR. The release phase packages the artifact and
checks it by using it. The check is worth nothing from the hand that assembled
the package. A REVIEWER at the release gate reads the README and runs the
installer the way a stranger would.
