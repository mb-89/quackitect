---
form: level-records
by: agent
signed_off: 2026-08-16T08:03:39.406Z
authors: agent
files:
---

# Evidence form / level-records

## current_situation

level-records is done, and doing it proved the plan's chunk boundary is not in the code.

WHAT THIS CHUNK OWED: every open record's folder standing on trunk, so no path has to reach into .worktrees to find one.

THE DATA HALF WAS ALREADY DONE by the rescue: 33 record folders committed at 336dfaf2.

THE CODE HALF BROKE TWELVE TESTS the moment it landed alone, and the reason is worth keeping. `itList` was changed to read folders under project/spec/iterations. The seed still wrote its record INSIDE a worktree. So the list read one place and the seed wrote another, and the container came back empty.

THE BOUNDARY BETWEEN THIS CHUNK AND cut-worktrees-from-seed IS NOT REAL. "Records stand on trunk" is simply false until the seed stops writing into a worktree, so the two are one change and were made as one.

## built

engine/iterations.ts and engine/survey.ts.

THE LIST READS FOLDERS. `itList` walks project/spec/iterations and takes every directory carrying a record.md. It used to enumerate `it/*` branches and call a record open when a worktree directory existed — two filesystem questions where the record already had the answer.

A FOLDER WITHOUT A RECORD IS NOT A RECORD. Evidence can be written before the record on a half-made seed, and a bare directory must never put an iteration on the container's offer.

THE SEED MINTS A FOLDER ON TRUNK AND NOTHING ELSE. No worktree, no branch, no push, no npm install. The push existed to announce a stub to a peer that would claim it, and the claim system is retired.

itAdopt IS GONE. It was the second machine's half of the seed: a peer cloned, got the branch alone, and had to check it out before the record could be seen. A clone that has trunk now has every record by construction, so there is no half left to bind.

MEASURED: run test-msviovga-26, 21 of 21 across iterations, onetree and worktree.

## follow_up

- THE PLAN SAID NINE CHUNKS AND THE CODE HAS SEVEN. level-records and cut-worktrees-from-seed are one change; collapse-record-read fell out of it rather than needing its own pass. The build-chunks drawing is not rewritten mid-walk, so the merged chunks are recorded here instead.
- FOUR CASES WERE REPOINTED, not deleted, because this chunk changed where a record lives and not what the cases assert. Three in iterations.test.ts read the pin, the record and the evidence through `.worktrees/<id>/`; one in surveywindow.test.ts stamped a shipped status there.
- NEXT IS delete-the-seam, which is the inspection red this iteration cannot close by test: Roots.bound, machineRootOf, fansOut, methodFilesIn, setMethodMirror and fanOutMethod all still stand.

## anything_else

ONE DEFINITION OF FINISHED, and it is the defect this chunk was named for.

BEFORE: survey.ts held `const FINISHED = new Set(["shipped", "closed"])` and applied it to its own list. `itList` knew nothing about it and answered from the filesystem.

SO TWO READERS DISAGREED ABOUT ONE RECORD. On 2026-08-16 i28 carried `status: shipped` with its worktree still standing: the survey left it out, the container kept it in, and nothing anywhere said they disagreed.

NOW: `RECORD_FINISHED` is exported from iterations.ts and applied inside `itList`, so every reader gets the same answer from the same place. survey.ts no longer filters at all — there is nothing left for it to filter.
