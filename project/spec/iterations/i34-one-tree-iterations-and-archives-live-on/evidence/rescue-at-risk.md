---
form: rescue-at-risk
by: agent
signed_off: 2026-08-16T07:57:03.031Z
authors: agent
files:
---

# Evidence form / rescue-at-risk

## current_situation

The rescue is done and it found more than the plan expected.

WHAT WAS PLANNED: fourteen at-risk files, a number carried from earlier in the walk. The chunk's own statement demands the count be re-measured at the moment it runs, and that is what changed the answer.

TWENTY-EIGHT WORKTREES STOOD, sharing one .git with the main and v2 checkouts. Every one of them read as dirty, 80 to 88 files each.

THE DIRT WAS NOT WORK. Each worktree carries a copy of trunk's own deliverable, put there by the method levelling, and it reads as modified against that branch's older HEAD. Measuring the branch against trunk rather than the worktree against its branch is what separated the two.

## built

THREE COMMITS, and the count each one carries was measured at the moment it ran.

1. 336dfaf2 — THIRTY-THREE RECORD FILES, 1,971 lines. Every seeded record's record.md stood only on its own it/* branch; trunk carried one iteration folder, i27. They are now in the tree. Six of the thirty-three had no worktree at all, so a worktree sweep would have missed them.

2. THE i28 MERGE. i28 shipped and its whole specification — 166 files — existed only on its branch, while the code it describes was already on trunk and running in the battery. Twenty-three conflicts, resolved by class: four in code and the cage took trunk's newer side, nine claim-system nodes stayed deleted, ten live trace nodes were unions and were merged as such. The owner ruled the iteration folder is not needed, so only i28's record.md survives of it.

3. THE SWEEP AFTER IT. The merge carried two machine-locking nodes back — req-a-held-iteration-names-its-holder and raid-dec-a-claim-ends-only-when-a-person-releases-it — and both are deleted again. Two dangling references were repaired: req-record-status-comes-from-the-record pointed at the deleted use case, and el-record-store's prose still handed the worktree to the ledger.

MEASURED AFTER: the trace is whole at 83 of 83 (test-msvifvsr-22), and the battery stands at 1321 of 1325 (test-msvides4-21) with the two remaining reds belonging to chunks not yet built.

## follow_up

- THE STORY HAD TO COME BACK, and that is the finding this chunk owes the record. sty-work-on-two-machines was deleted with the claim system, and uc-start-an-unattended-machine refines it and nothing else. The trace checks went red on exactly that. The need never rested on the lock — the owner's own words are "it's just two agents on two different clones" — so the story stands with its mechanism rewritten and the use case hangs off it again.
- A RESTORED VALUE WAS RESTORED WRONG, and the merge caught it. raid-asm-session-identity-survives-a-reload carried `probe: holds by inspection` from 2026-08-14 while its own body recorded the 2026-08-15 measurement that FALSIFIED it. The repair earlier this session put the older value back over the newer one. i28's side now stands.
- THE OTHER NINE RESTORED PROBE VALUES ARE OWED THE SAME CHECK. One was wrong by date, so the rest cannot be assumed right. That is note-worthy rather than this chunk's work.
- THE NODE FLOOR WAS FIXED FOR FREE. i28 declared engines.node >= 24; trunk said >= 22.6, a whole major below what `node <file>.ts` needs. The merge brought the fix and note-e6b05a0a53ce is drained.
- NEXT IS level-records, and most of it is already standing: every record's folder is in the tree. What is left there is the code half.

## anything_else

WHY THE PLANNED COUNT WAS WRONG, and it is worth keeping because the same mistake is easy to repeat.

THE FOURTEEN CAME FROM A WORKTREE SWEEP. That asks each worktree what is uncommitted in it, and every worktree answered 80 to 88 files, because each holds a copy of trunk's deliverable that reads as modified against its own older branch.

THE RIGHT QUESTION IS ASKED OF THE BRANCH, NOT THE TREE. `git diff v3...<branch>` names what that branch changed since it left trunk. Answered that way, 26 branches hold exactly one file each, i34 holds six, and i28 holds 166.

SIX RECORDS HAD NO WORKTREE AT ALL. i1, i2, i3, i8, i12 and i27 have branches and no directory, so any sweep over `.worktrees` would have missed them silently. The rescue ran over BRANCHES for that reason.

THE RISK ENTRY WAS RIGHT AND FOR THE RIGHT REASON. raid-risk-the-deletion-takes-work-the-rescue-step-missed says a rescue working from a stale list is the failure. The list was stale, it was stale by a factor of twelve on i28 alone, and re-measuring is what found it.
