---
form: dead-branch-code-goes
by: agent
signed_off: 2026-08-16T18:06:54.384Z
authors: agent
files:
---

# Evidence form / dead-branch-code-goes

## current_situation

THE BRANCH CODE OUTLIVED THE BRANCHES.

listBranches answered one question: which records exist? It read local and pushed it/* and exp/* branches and merged them, because a fresh clone carries no local branch for a record it did not check out.

i34 MADE A RECORD A FOLDER ON TRUNK. itList and expList read directories now. The listing had no caller left.

IT WAS STILL EXPORTED, STILL CACHED, AND STILL PAYING. Seven ref paths stat'd per pass to key a cache for a function nobody called.

AND IT WAS NOT ALONE. Two more readers still asked git for a record on a branch, both for files that i34 leaves on disk.

## built

EVERY READER OF A BRANCH THE SEED NO LONGER MAKES IS DELETED.

IN engine/worktree.ts:

- listBranches, the merged local-and-pushed listing.
- branchList, its stamp-keyed cache.
- REF_STAMP with refStamp and refStampNow — seven stats per pass that existed only to key that cache.
- bustBranchList, whose own comment claimed the lane's seed and close both called it. Neither did.

EXP_LIST STAYS AND NEEDS NO BUSTER. It is keyed on the pass epoch, a pass is one synchronous operation, and outside a pass the epoch is 0 and nothing is cached at all. The comment says so now rather than pointing at a function that is gone.

IN engine/expmachine.ts: the archive's branch fallback. A closed expedition's record used to live on its branch, so a record not on disk was fetched with git cat-file --batch over <branch>:<rel>, batched and cached. i34 leaves the folder where it is through the close, so a record not on disk is not anywhere. closedRecords is now one file read per record. recordCache went with it.

IN engine/mirror.ts: two git show exp/<id>:<path> fallbacks, one for a dismissed expedition's decisions.jsonl and one for its report. Same reason — dismissal does not move the folder.

FOUR UNUSED IMPORTS FELL OUT: statSync from worktree.ts, spawnSync from both expmachine.ts and mirror.ts.

RUNS. 31 of 31 over the five files this iteration touched. Then 24 of 24 over the three files the close spec names plus the archive — worktree, gitlane, editsafety, archive — which is what answers whether deleting the branch readers broke the close or the archive.

THE FIRST OF THOSE TWO RUNS NAMED A FILE THAT DOES NOT EXIST. deliverable/tests/close-and-land.test.ts is a test-spec id, not a path, and node ignored it in silence rather than failing. The close went unchecked in that run, which is why the second one exists. The spec names editsafety, gitlane and worktree.

## follow_up

THE TWENTY-SIX BRANCHES CAN GO. Nothing in the engine reads origin/it/* or origin/exp/* any more. Deleting them is the OWNER'S act, because the agent never pushes.

ONE IS NOT IN THAT SET: iter/i13-guidance-library is merged into neither v2 nor v3, and must not be deleted blind.

THE BRANCH FIELD STILL RIDES EVERY RECORD. Iteration and Expedition both carry branch: it/<id> and exp/<id>, and nothing reads either now. It is a lie in a data structure rather than a live path, so it is a note for the sweep rather than this chunk's work.

A MISSING TEST FILE PASSES SILENTLY under node --test. That cost one run here and would cost more in a battery that names files by hand. Worth a check that every path a test-spec names exists — which is what red-observed.ts already does for the specs it reads, and nothing does for anyone else.

THE BUILD IS DONE: fifteen of fifteen chunks signed. trace-design is next, then verification fires the battery that covers every run owed since chunk six.

## anything_else

