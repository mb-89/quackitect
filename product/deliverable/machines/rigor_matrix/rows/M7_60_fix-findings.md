---
kind: matrix-row
name: fix-findings
statement: "Fix the battery's findings: all of them, in one pass."
state_kind: work
filled_by: agent
depends_on:
  - verification
edge_role: fallback
guard: "verification_attempts < 3"
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
  - se_lint
  - se_git
evidence:
  - name: findings_fixed
    description: "every finding and its fix, one pass"
major: full
minor: full
patch: full
product: full
specification: tailored
major_note: |
  Applies as drawn: collect all, one pass, one confirm run, escape when
  the guard exhausts.
minor_note: |
  Applies as drawn: collect all, fix in one pass, one confirm run, escape
  when the guard exhausts.
patch_note: |
  Applies as drawn: collect everything, fix in one pass, one confirm run,
  escape to a human when the guard exhausts. The loop does not shrink
  because the change was small.
product_note: |
  Standing obligation: findings get fixed in collected passes, never
  one-at-a-time whack-a-mole; the exhausted guard escapes to a human and
  that escape is a recorded signal, mined at the retro.
specification_note: |
  DOCUMENT FORM: the findings-and-fixes list in the run record. Archive
  material only.
---

## Guidance

The battery law's fix half ([[meth-test-first]]). FALLBACK from verification while verification_attempts < 3; the recovery edge re-runs verification ONCE. Collect EVERY finding the run surfaced before fixing anything; fix them all; then the single confirm run. When the guard exhausts, the machine escapes to a human.
