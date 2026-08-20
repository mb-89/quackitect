---
form: remove-artefacts
by: agent
signed_off: 2026-08-16T09:05:28.632Z
authors: agent
files: null
---

# Evidence form / remove-artefacts

## current_situation

The artefacts are gone and the tree stands: 1299 of 1299, run test-msvkb5yd-1, from trunk with nothing else on disk.

THIS IS THE ONLY IRREVERSIBLE ACT IN THE ITERATION, which is why it ran last and why its count was re-measured at the moment it ran rather than trusted from the plan.

## built

WHAT WAS REMOVED, counted at the moment it ran.

- 28 WORKTREES under `.worktrees/`, then the directory itself.
- 67 BRANCHES: every `it/*`, every `exp/*`, and `claims`.
- WHAT STAYS: `main`, `v2`, `v3`. Four `iter/*` branches belong to v2 and were left alone.

THE EVIDENCE THAT NOTHING UNIQUE WAS LOST, gathered before anything was deleted. Every commit on every branch that was not on trunk was grouped by message, and each fell into one of five kinds.

- `the machine levels this tree with trunk (N files)` — stale copies of trunk's own engine, put there by the levelling this iteration deletes.
- `the machine commits what stood on disk at a reload` — the same.
- `seed <id>`, `started`, `pin <size>` — the record files, rescued to trunk in commit 336dfaf2.
- i28's own commits — merged back whole at the rescue step.
- i34's own commits — merged to trunk immediately before the deletion.

NO SIXTH KIND EXISTED. The per-branch file counts looked alarming at first — 79, 123, 176 files "not on trunk" — and every one of them was trunk's own older content copied in by the levelling. `git diff v3...<branch>` reads a levelling commit as the branch's change, which is why the count had to be explained rather than believed.

## follow_up

- THE ENGINE DIED MID-REMOVAL AND I CAUSED IT. The lane was running from inside `.worktrees/i34-…/project/deliverable/engine`, and removing that worktree deleted the code out from under the running process. 26 of 28 were removed before it stopped.
- THE CODE WAS NEVER AT RISK. Only the copy the process was reading. Restarting the lane from trunk brought it back, and it cannot recur: there are no worktrees left to run from, which is the point of the iteration.
- THE RIGHT ORDER WAS AVAILABLE AND I DID NOT TAKE IT: remove the other 27 first and leave the one the engine is running from for last, after a reload onto trunk. Removing the ground you are standing on is not a subtle mistake, and it cost one restart.
- THE CHECK THAT MATTERED CAUGHT A REAL ONE. Immediately before deleting, trunk held ONE record folder and NONE of i34's evidence — all the record work was still on the branch, because the lane wrote method paths to trunk and record paths to the worktree. Deleting then would have destroyed the whole iteration. The merge landed 35 record folders, 25 evidence forms and 700 trace nodes.
- THAT IS raid-risk-the-deletion-takes-work-the-rescue-step-missed FIRING ON THE LAST STEP, which is exactly what it was written for.

## anything_else

WHY THE FOUR `iter/*` BRANCHES SURVIVE, since the instruction was to delete what is left.

THEY ARE NOT THIS PRODUCT'S. They belong to quackitect-v2, which is a separate checkout sharing one `.git`, and one of them has a live worktree at `quackitect-v2/.worktrees/i13-guidance-library`.

THE OWNER'S RULING NAMED `main` AND `v2` AS KEPT. These four are v2's history under a different prefix, and deleting them would reach outside this product into another one.

A DELETION THAT REACHES INTO A NEIGHBOUR IS NOT THE SAME ACT as clearing your own. It is recorded here rather than done quietly either way.
