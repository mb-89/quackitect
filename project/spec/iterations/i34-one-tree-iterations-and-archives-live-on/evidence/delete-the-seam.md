---
form: delete-the-seam
by: agent
signed_off: 2026-08-16T09:41:50.128Z
reopened: "2026-08-16T09:24:33.118Z — a tester with fresh eyes found three tree-choosers still standing — Session.recordRoot, twoTrees in gitlane.ts, and Session.corpora() — so the claim that no call selects between trees does not pass its own content"
authors: agent
files:
---

# Evidence form / delete-the-seam

## current_situation

The seam is deleted and the whole tree stands: 1297 of 1297, run test-msvm54ge-9, from trunk with no worktrees on disk.

THIS CHUNK ANSWERS THE ONE REQUIREMENT NO TEST CAN. req-every-record-path-resolves-in-one-tree verifies by INSPECTION, because it demands the ABSENCE of a chooser. A test can show one path resolving correctly; only reading the code shows that nothing anywhere is picking a tree.

THIS CLAIM WAS REOPENED AND RE-EARNED. It first signed naming six symbols and all six were gone — but a tester with fresh eyes found THREE MORE the list had never mentioned, and the claim is about the absence of a chooser rather than about a list of six. It was reopened rather than amended, because its own content genuinely did not pass.

## built

NINE SYMBOLS, NOT SIX. The first six were named at observe-red; the last three were found by a tester at verification, against the standard this chunk's own comment sets — a chooser that happens to have one branch is still a chooser.

THE CHOOSER ITSELF — engine/resolve.ts.

- `Roots.bound` is deleted from the interface. There is one root and it is the machine's.
- `storeFor` returned `roots.bound ?? roots.machine` for anything the core did not own. It returns `roots.machine`, always. It is kept as a function rather than inlined, because `store` still rides every answer and req-a-resolution-is-proven-by-read-back still wants a name to compare against.
- A bare string root was read as "the tree I am standing in", with the machine root derived by stripping `.worktrees/<id>`. It is now simply the root.

THE DERIVATION — engine/paths.ts. `machineRootOf`, `fansOut` and `methodFilesIn` are deleted. The first stripped a worktree segment off a path; the other two existed only because several trees held copies of one method file.

THE COPYING — engine/files.ts and engine/session.ts. `setMethodMirror`, the mirror map, `mirrorFor` and `mirrorMethod` are deleted, with all four call sites on the write path. `fanOutMethod` and `methodTrees` are deleted from the session.

THE LEVELLING THAT KEPT THE COPIES IN STEP — engine/session.ts. `reconcileTrees`, `backfillMethod`, `backfillInto` and `levelTree` are deleted.

THE THREE THE TESTER FOUND, and each was reached on an ordinary call.

- `Session.recordRoot` — engine/session.ts, on EVERY lane call for a record path via `laneRoot`. It asked which tree owned a record and answered the worktree or undefined. Both answers became the root, so it returned correctly and kept asking. Its own docstring was already false: "An OPEN record owns its worktree... A CLOSED one has landed and its tree is gone."
- `twoTrees` — engine/gitlane.ts, with `gitLand` and `gitSync`. It refused when the two roots were equal, which they always are now, so BOTH VERBS REFUSED EVERY CALL while their descriptions still promised a reconciliation. All three are deleted, and `se_git_land` and `se_git_sync` are gone from the lane.
- `Session.corpora()` — engine/session.ts, feeding a live dropdown. It offered trunk plus one entry per open iteration, every entry sharing one path, and DEFAULTED TO THE LAST OPEN ITERATION rather than trunk. It returns trunk alone.

WHAT `workRoot` ANSWERS NOW is the machine root, unconditionally. It was `this.bound?.path ?? this.machineRoot()`, and that expression was the seam's other face.

MEASURED: 1297 of 1297, test-msvm54ge-9, with biome and preflight green.

## follow_up

- THE DEFECT REPRODUCED ITSELF DURING ITS OWN REMOVAL, and this is the finding worth keeping. Midway through this chunk `resolve.ts` held two different versions: trunk had the seam deleted, the bound worktree had it intact. se_file_read answered from one and se_file_search from the other, and both were correct against their own root.
- ONLY A SHELL READ OF BOTH ABSOLUTE PATHS SETTLED IT. No lane call could, because every lane call is resolved by the seam under repair. That is the sharpest possible argument for the change, and it arrived by accident.
- IT IS WORD FOR WORD THE DEFECT `machineRootOf`'s OWN COMMENT DESCRIBED, dated 2026-08-14: a write landing in the tree the person was not looking at, reading on screen as a broken feature rather than a missing merge.
- THE LIST OF SIX WAS THE MISTAKE, and it is the lesson this chunk owes the next one. A requirement demanding an ABSENCE cannot be discharged by a list, because the list is written by the same person who missed the thing. Three of nine were invisible to the author and obvious to a reader who had never seen the code.
- WHAT MADE THE THREE HARD TO SEE: none of them returns a wrong answer. Every one returns the root, correctly, having asked a question with one answer. A test cannot fail on that and a battery never will.
- se_git_land AND se_git_sync WERE DEAD IN PUBLIC. They refused every call for as long as the worktrees have been gone, while the lane still advertised them. Nobody noticed because nobody called them.

## anything_else

WHY `storeFor` SURVIVES AS A FUNCTION THAT ALWAYS RETURNS THE SAME THING, and why `recordRoot` did not.

BOTH READ AS DEAD CODE and only one is. The difference is checkable rather than aesthetic, and getting it wrong in either direction is a defect.

`storeFor` STAYS. req-a-resolution-is-proven-by-read-back demands that every answer NAMES the store it resolved against. That requirement stands, tsp-read-back-inspection verifies it, and i34 does not touch it. An answer still has to carry a store name, so something still has to compute one. What was deleted is the CHOICE, not the naming.

`recordRoot` GOES. Nothing required it to name anything. Its only output was which tree to use, and there is one tree, so its whole job is gone rather than reduced to a constant.

THE TEST BETWEEN THEM: does anything still need this function's ANSWER? Where the answer is still owed to a requirement, the function stays and its body collapses. Where the answer was only ever used to pick, the function goes.
