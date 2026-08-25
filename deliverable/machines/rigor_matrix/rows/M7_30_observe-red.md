---
kind: matrix-row
name: observe-red
statement: "Observe RED: every new check runs and fails before the build."
state_kind: work
filled_by: agent
depends_on:
  - specify-build
exit_script:
  - deliverable/engine/bin/red-observed.ts
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_run
evidence:
  - name: red_observed
    template: checklist
    items:
      - $claim-specs
    description: one checkbox per non-test spec — the reds no run can show. The engine observes the test reds itself.
major: full
minor: full
patch: full
product: full
specification: tailored
major_note: |
  Applies in full. Every new check fails before the build.
minor_note: |
  Applies in full. Every new check runs and fails before the build.
patch_note: |
  Applies in full. The reproducing check runs and FAILS before the fix
  lands. This is the cheapest state in the battery and the one that proves
  the fix fixes anything.
product_note: |
  Standing obligation: no check in the suite went green without ever
  having been seen red. The red observation is recorded per check, once,
  at its birth.
specification_note: |
  DOCUMENT FORM: the red-run reference in the iteration record, per
  check. Proof, not prose.
---

## Guidance

Last before the build, before any code lands ([[meth-test-first]]). A check green with no realized design is suspect.

ONLY WHAT A PERSON MUST DO IS LISTED. The
checklist holds the NON-TEST specs — demonstration, inspection,
analysis — where no run can show the red. One deliberate check per
spec. Checking claims one of two things:

- the red was observed — the procedure fails today, as it should
- red is impossible for a spec covering standing behavior, and that is
  accepted

THE TEST REDS ARE THE ENGINE'S, and now mechanically so. The submit
fires [[red-observed]]: it reads every test-spec minted in the open
record whose method is `test`, runs the files they name, and refuses
unless at least one case FAILS. The agent never runs them.

WHY A REFUSAL AND NOT A WARNING. This state
had no test verb to begin with, so the agent reached for the shell, and
a truncating pipe ate the output it reached for. The owner rejected
granting the verb in the same breath as proposing this: it keeps the
agent deciding when a check runs, which is the habit being removed.

THREE THINGS FAIL IT, and each names a different hole.

- A check that PASSES before the build. Green from birth proves nothing.
- A file that does not exist. The check was never written.
- A run with no TAP summary, or zero cases. An instrument failure must
  never read as a red.
