---
id: i34-one-tree-iterations-and-archives-live-on
status: open
started: 2026-08-16T05:19:13.376Z
opened: 2026-08-16T05:12:33.070Z
goal: "One tree: iterations and archives live on disk on trunk, worktrees and record branches are gone, and the resolution seam that picks between trees is deleted rather than fixed."
vision: "OWNER RULINGS, 2026-08-16, in their order.\n\n- \"We need to get away from this nonsense where data isn't found because it's on some worktree. The agents spend too much time working around that.\"\n- \"I want everything on trunk.\" Seeded and active iterations stand as folders on disk.\n- \"We can keep the archive on disk too.\" A closed record stays where it is. No manifest, no stored hash, no read out of git.\n- \"I don't need the expeditions anymore. I don't need the closed iterations anymore. We can switch the system and lose the history. I'm actually fine with that.\"\n- Keep the 26 seeded stubs. Those are the backlog, not history.\n- \"You also remove the iteration branches in Git, and you also remove the claims branch.\"\n- \"The archive renderer still needs to work. The iterations substate machines still need to work.\"\n\nWHAT DONE LOOKS LIKE. One checkout. Nothing chooses a tree, because there is only one. An agent asking for `project/spec/iterations/<id>/record.md` gets the only copy there is.\n\nTHE MEASUREMENTS THAT DECIDED IT, taken 2026-08-16.\n\n- 27 worktrees hold 303,714,168 bytes across 30,680 files. The whole object store for v1, v2, v3 and 109 refs is 52.15 MiB, and 26.63 MiB once repacked.\n- A seeded stub's own content is 3,198 bytes in 2 files. Its checkout is 9,561,381 bytes in 1,030 files.\n- Of 1,868 uncommitted paths across all worktrees, 1,854 are byte-identical to trunk. Trunk's content, duplicated 27 times.\n- The 14 that are not are iteration records, and they are real work: i11 +182 lines, i17 +88, i5 +49, i29 +37, i31 +25, i10 +19, i23 +16, i16 +12, i19 +12, i21 +2, i24 +2, i32 +1, plus decisions.jsonl in i4 and i23 never committed at all.\n- i28 shipped 2026-08-15 at 20:49 and its worktree is still standing.\n\nTHE COUPLING IS ONE LINE. Every record path is already a pure function of the id and knows nothing about a tree: `itRecordRel` at engine/iterations.ts:52, `itPinRel` at :243, `itSeededRel` at :247. The tree enters at `join(it.path, rel)`, engine/iterations.ts:59. Make that root always trunk and every path is already correct.\n\nTHE ORDER, agreed with the owner.\n\n1. RESCUE FIRST. Copy the 26 stub records onto trunk before anything is deleted. Nothing destructive runs until this stands.\n2. STATUS BECOMES THE OPEN FLAG. Six sites, one edit each: `itList` engine/iterations.ts:70-79, `itFind` :212, `generateIterations` :764, `generateIterationArchive` :1208, `expList` engine/worktree.ts:234-247. engine/survey.ts:65-68 already reads status and only simplifies.\n3. THE RECORD READ COLLAPSES to one read from trunk: `readItRecord` engine/iterations.ts:56-68 and `readRecord` engine/worktree.ts:86-109, each three fallbacks today.\n4. DELETE THE SEAM THAT PICKS TREES. `storeFor`'s branch engine/resolve.ts:48 and `Roots.bound` :29; `machineRootOf` engine/paths.ts:237; `fansOut` :210 and `methodFilesIn` :267; `setMethodMirror` and `fanOutMethod` engine/session.ts:279-281; `itAdopt` engine/iterations.ts:82-99; engine/claims.ts entire, with `pushSeed` at engine/iterations.ts:206 and engine/worktree.ts:313. KEEP `recordOwnerOf` and `pathKind` engine/paths.ts:191-205 — they still say which record owns a path and keep `.se` machine-local.\n5. CUT THE WORKTREE OUT OF SEED AND CLOSE. `git worktree add` engine/worktree.ts:274 and the npm install at :283; `mergeAndRetire` :434-470 including the `git rm -r` at :466, because the archive now stays on disk; `itCloseShipped` :489-512 and `expClose` :517-541 reduce to stamping status and committing.\n6. REMOVE THE ARTEFACTS. 27 worktrees, 33 `it/*` branches, every `exp/*`, and `claims`. LEAVE `main` AND `v2` ALONE — they are v1 and v2 and they sit in the same unmerged list.\n7. REWRITE THE OBSOLETE TESTS. 66 references across 20 files. worktree.test.ts, resolution.test.ts, bound-engine.test.ts, method-guard.test.ts and claimops.test.ts largely go rather than change.\n\nWHAT NEEDS NO CHANGE, checked rather than assumed. The archive renderer — `buildArchive`, `buildDecades`, `buildRecordColumn` at engine/expmachine.ts:371 and :250 — takes `{sid, full, goal}` and never touches a tree. Only its feed changes. The sub-state machines and the evidence forms live inside the record folder at relative paths and move address with it. i27's folder, read at ref 5c9f850f, holds record.md, decisions.jsonl, 79 evidence files and six machines files including seeded.json.\n\nCONSEQUENCES THE OWNER ACCEPTED IN ADVANCE.\n\n- The archive starts EMPTY. The renderer works and shows nothing until the first close under the new model.\n- i1, i2, i3, i8, i12, i27, i28 and every expedition go. i27 alone is 87 files including 79 signed evidence forms.\n- The cloud runner's `adopt` step goes with the claims branch. A cloud machine will have no way to claim and no way to be refused.\n- Closed records stay searchable, because they stay on disk. That was the reason for keeping the archive there.\n\nTWO THINGS TO WATCH. This seed itself mints worktree number 28 under today's code, which step 5 then removes. And every stub worktree currently carries an uncommitted copy of trunk that nobody put there deliberately (note-5a434b119c3b) — step 1 must copy the RECORD, never the phantom content around it."
inputs:
  - "note-0d016e8178b2"
  - "note-b575e803af9c"
  - "note-b042c413e0e3"
  - "note-5a434b119c3b"
  - "note-c4c60089b369"
  - "note-a6d2f0781686"
  - "note-0a256ac21b27"
  - "note-e6c318aeb7a2"
  - "note-1bef0a5cc29b"
  - "note-232cbe3591ec"
  - "note-2605b620b8eb"
  - "note-f40b2052e59b"
  - "note-d3c18f094587"
  - "note-9391416c6203"
  - "note-238e5c575922"
  - "note-81168863130f"
depends_on:
---

# i34-one-tree-iterations-and-archives-live-on

## Goal

One tree: iterations and archives live on disk on trunk, worktrees and record branches are gone, and the resolution seam that picks between trees is deleted rather than fixed.

## Rough vision

OWNER RULINGS, 2026-08-16, in their order.

- "We need to get away from this nonsense where data isn't found because it's on some worktree. The agents spend too much time working around that."
- "I want everything on trunk." Seeded and active iterations stand as folders on disk.
- "We can keep the archive on disk too." A closed record stays where it is. No manifest, no stored hash, no read out of git.
- "I don't need the expeditions anymore. I don't need the closed iterations anymore. We can switch the system and lose the history. I'm actually fine with that."
- Keep the 26 seeded stubs. Those are the backlog, not history.
- "You also remove the iteration branches in Git, and you also remove the claims branch."
- "The archive renderer still needs to work. The iterations substate machines still need to work."

WHAT DONE LOOKS LIKE. One checkout. Nothing chooses a tree, because there is only one. An agent asking for `project/spec/iterations/<id>/record.md` gets the only copy there is.

THE MEASUREMENTS THAT DECIDED IT, taken 2026-08-16.

- 27 worktrees hold 303,714,168 bytes across 30,680 files. The whole object store for v1, v2, v3 and 109 refs is 52.15 MiB, and 26.63 MiB once repacked.
- A seeded stub's own content is 3,198 bytes in 2 files. Its checkout is 9,561,381 bytes in 1,030 files.
- Of 1,868 uncommitted paths across all worktrees, 1,854 are byte-identical to trunk. Trunk's content, duplicated 27 times.
- The 14 that are not are iteration records, and they are real work: i11 +182 lines, i17 +88, i5 +49, i29 +37, i31 +25, i10 +19, i23 +16, i16 +12, i19 +12, i21 +2, i24 +2, i32 +1, plus decisions.jsonl in i4 and i23 never committed at all.
- i28 shipped 2026-08-15 at 20:49 and its worktree is still standing.

THE COUPLING IS ONE LINE. Every record path is already a pure function of the id and knows nothing about a tree: `itRecordRel` at engine/iterations.ts:52, `itPinRel` at :243, `itSeededRel` at :247. The tree enters at `join(it.path, rel)`, engine/iterations.ts:59. Make that root always trunk and every path is already correct.

THE ORDER, agreed with the owner.

1. RESCUE FIRST. Copy the 26 stub records onto trunk before anything is deleted. Nothing destructive runs until this stands.
2. STATUS BECOMES THE OPEN FLAG. Six sites, one edit each: `itList` engine/iterations.ts:70-79, `itFind` :212, `generateIterations` :764, `generateIterationArchive` :1208, `expList` engine/worktree.ts:234-247. engine/survey.ts:65-68 already reads status and only simplifies.
3. THE RECORD READ COLLAPSES to one read from trunk: `readItRecord` engine/iterations.ts:56-68 and `readRecord` engine/worktree.ts:86-109, each three fallbacks today.
4. DELETE THE SEAM THAT PICKS TREES. `storeFor`'s branch engine/resolve.ts:48 and `Roots.bound` :29; `machineRootOf` engine/paths.ts:237; `fansOut` :210 and `methodFilesIn` :267; `setMethodMirror` and `fanOutMethod` engine/session.ts:279-281; `itAdopt` engine/iterations.ts:82-99; engine/claims.ts entire, with `pushSeed` at engine/iterations.ts:206 and engine/worktree.ts:313. KEEP `recordOwnerOf` and `pathKind` engine/paths.ts:191-205 — they still say which record owns a path and keep `.se` machine-local.
5. CUT THE WORKTREE OUT OF SEED AND CLOSE. `git worktree add` engine/worktree.ts:274 and the npm install at :283; `mergeAndRetire` :434-470 including the `git rm -r` at :466, because the archive now stays on disk; `itCloseShipped` :489-512 and `expClose` :517-541 reduce to stamping status and committing.
6. REMOVE THE ARTEFACTS. 27 worktrees, 33 `it/*` branches, every `exp/*`, and `claims`. LEAVE `main` AND `v2` ALONE — they are v1 and v2 and they sit in the same unmerged list.
7. REWRITE THE OBSOLETE TESTS. 66 references across 20 files. worktree.test.ts, resolution.test.ts, bound-engine.test.ts, method-guard.test.ts and claimops.test.ts largely go rather than change.

WHAT NEEDS NO CHANGE, checked rather than assumed. The archive renderer — `buildArchive`, `buildDecades`, `buildRecordColumn` at engine/expmachine.ts:371 and :250 — takes `{sid, full, goal}` and never touches a tree. Only its feed changes. The sub-state machines and the evidence forms live inside the record folder at relative paths and move address with it. i27's folder, read at ref 5c9f850f, holds record.md, decisions.jsonl, 79 evidence files and six machines files including seeded.json.

CONSEQUENCES THE OWNER ACCEPTED IN ADVANCE.

- The archive starts EMPTY. The renderer works and shows nothing until the first close under the new model.
- i1, i2, i3, i8, i12, i27, i28 and every expedition go. i27 alone is 87 files including 79 signed evidence forms.
- The cloud runner's `adopt` step goes with the claims branch. A cloud machine will have no way to claim and no way to be refused.
- Closed records stay searchable, because they stay on disk. That was the reason for keeping the archive there.

TWO THINGS TO WATCH. This seed itself mints worktree number 28 under today's code, which step 5 then removes. And every stub worktree currently carries an uncommitted copy of trunk that nobody put there deliberately (note-5a434b119c3b) — step 1 must copy the RECORD, never the phantom content around it.

## Inputs

- note-0d016e8178b2
- note-b575e803af9c
- note-b042c413e0e3
- note-5a434b119c3b
- note-c4c60089b369
- note-a6d2f0781686
- note-0a256ac21b27
- note-e6c318aeb7a2
- note-1bef0a5cc29b
- note-232cbe3591ec
- note-2605b620b8eb
- note-f40b2052e59b
- note-d3c18f094587
- note-9391416c6203
- note-238e5c575922
- note-81168863130f
