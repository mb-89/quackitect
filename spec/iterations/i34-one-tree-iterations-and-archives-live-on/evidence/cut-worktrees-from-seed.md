---
form: cut-worktrees-from-seed
by: agent
signed_off: 2026-08-16T08:08:43.561Z
authors: agent
files: null
---

# Evidence form / cut-worktrees-from-seed

## current_situation

The seed mints a folder and nothing else, and minted_in has a source that survives the change.

THE SEED HALF landed with level-records, because the two are one change: a list that reads folders finds nothing while the seed writes into a worktree.

THE minted_in HALF WAS ITS OWN PROBLEM and it would have failed silently. The stamp read the record id out of the write's root, as the `<id>` in `.worktrees/<id>`. With no worktrees that pattern never matches, so every trace node minted from then on would have carried no minted_in at all, and nothing would have said so.

## built

engine/iterations.ts, engine/model-fs.ts, engine/tools.ts, engine/session.ts.

THE SEED: `itSeed` writes the record folder under the root, stages it and commits. Gone with it are the worktree add, the branch creation, the seed push and the npm install into a second tree.

itAdopt IS DELETED. It existed so a peer that cloned and got only the branch could check it out into the worktree the rest of the engine expected. A clone that has trunk now has every record, so there is no missing half to bind.

THE STAMP ASKS THE WALK. `ModelFileSystem` takes a `boundRecord` getter, `coreTools` passes `session.boundRecordId()`, and the session answers `this.bound?.id`. The path scrape is gone.

WHY THAT IS ALSO MORE HONEST than the path: what the field records is which record was open when the node was written, and the walk is the thing that knows it. The path only ever agreed by construction.

MEASURED: run test-msvivlaq-29, 19 of 19 over claimops, reopen and drawnsub — the three files whose cases wrote a record's evidence into a worktree.

## follow_up

- FIVE MORE CASES WERE REPOINTED and the expedition ones deliberately were not. claimops, reopen (three places) and drawnsub wrote an ITERATION's evidence under `.worktrees/<id>/`. iterations.test.ts, container.test.ts, search.test.ts, resolution.test.ts, worktree.test.ts, method-guard.test.ts and node-scoping.test.ts all still name `.worktrees`, and every one of those is about an EXPEDITION or is a unit fixture. Expeditions keep their worktrees; i34's scope is iterations and the archive.
- backfill-minted.ts STILL READS BRANCHES. It is a one-shot that gave every existing node a minted_in by asking which branch first carried it. It has already run, and it is named here rather than left to be discovered.
- NEXT IS delete-the-seam, the inspection this iteration cannot close by test.

## anything_else

THE SILENT FAILURE IS THE POINT OF THIS CHUNK, and it is worth stating plainly because nothing would have caught it.

A STAMP THAT STOPS STAMPING BREAKS NOTHING. No test asserts that a newly written trace node carries minted_in. The corpus checks care that edges resolve, not that provenance was recorded. So the field would simply have stopped appearing on new nodes, and the first person to notice would have been somebody asking a year later which iteration minted something.

IT WAS FOUND BY READING THE CHUNK'S OWN STATEMENT rather than by a failure. The build plan said "minted_in takes a source that does not name a branch", which is a demand no red could have produced.

THAT IS WHAT A WRITTEN BUILD PLAN BUYS. The other eight chunks were each driven by a red or by a compile error. This one was driven by a sentence.
