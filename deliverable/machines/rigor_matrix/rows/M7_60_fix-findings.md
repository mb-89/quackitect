---
kind: matrix-row
name: fix-findings
statement: "Fix the battery's findings: all of them, in one pass."
state_kind: work
filled_by: agent
depends_on:
  - verification
entry_read:
  - deliverable/machines/methods/meth-find-the-fault.md
edge_role: fallback
exit_script:
  - deliverable/engine/bin/battery.ts
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_delete
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_run
  - se_test
  - se_lint
  - se_git
major: full
minor: full
patch: full
product: full
specification: tailored
major_note: |
  Applies as drawn. Collect them all, fix in one pass, confirm in one run. The
  confirm run is the exit: red keeps the walk here.

  THE SCOPED QUESTION IS LEGAL HERE, and it has to be. This is the state whose
  whole job is understanding failures, and without se_test its only instrument
  was the confirm run — the whole battery, ninety seconds, fired by every pull
  that tried to advance. A walker checking one fix had to run everything.

  SO ASK NARROWLY WHILE FIXING, AND CONFIRM ONCE AT THE END. The engine still
  decides what a scoped question runs, and the confirm run still holds the
  state. Nothing about the hold changes.
minor_note: |
  Applies as drawn. Collect them all and fix in one pass, then one confirm run.
  The confirm run is the exit: red keeps the walk here.
patch_note: |
  Applies as drawn: collect everything, fix in one pass, one confirm run. The
  loop does not shrink because the change was small.
product_note: |
  Standing obligation: findings get fixed in collected passes, never
  one-at-a-time whack-a-mole. A walk that cannot get the battery green stays
  here rather than bouncing, and the person sees it standing.
specification_note: |
  DOCUMENT FORM: the findings-and-fixes list in the run record. Archive
  material only.
---

## Guidance

The battery law's fix half ([[meth-test-first]]). FALLBACK from verification; the recovery edge re-runs verification ONCE. Collect EVERY finding the run surfaced before fixing anything; fix them all; then the single confirm run.

NO EVIDENCE OF ITS OWN (owner ruling 2026-08-11). The findings ARE the
red verifications — a generated list, nothing anyone answers here. The
proof is the confirm run going green, and verification records that.

THE CONFIRM RUN IS WHAT HOLDS THIS STATE, and until 2026-08-18 nothing did.
A state with no evidence form and no exit script completes the moment it is
entered, so the walk fell INTO the repair state and straight back out of it,
having repaired nothing. Measured on the i35 cloud run: "the state whose
whole job is repair cannot be occupied long enough to repair anything."

SO THE EXIT SCRIPT IS THE CONFIRM RUN. Leaving fires the battery; a red
battery leaves the exit condition unmet and the walk STAYS here, with the
write verbs it already has. That is the owner's rule in one mechanism —
verification fixes, it does not loop — and it keeps the ruling above exactly
as it stands: there is still nothing for anyone to answer.

THE ATTEMPT GUARD IS GONE, and it was never real. The row carried
`guard: verification_attempts < 3` and promised an escape when it exhausted.
Nothing in the engine ever wrote that counter, so the guard was permanently
true and the escape could never fire. Making the counter real without an
escape path is worse than not having it: the fourth red would fire no edge,
activate nothing, and throw. The hold above bounds the loop properly — the
walk waits here until the battery is green, rather than bouncing between two
states at seventy-eight seconds a round.

THE GATEKEEPER WATCHES THE FIXES ([[meth-verification-discipline]]).
The same tester that verified stays across the rounds. Show it the
deltas; never respawn it to reread from zero.

HOW to find each fault is its own method ([[meth-find-the-fault]]):

- reproduce first
- simplify until only the error remains
- bisect the space that holds it
- one change per run
- for a physical system, reproduce and fix in simulation first
