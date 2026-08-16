---
form: collapse-record-read
by: agent
signed_off: 2026-08-16T08:05:10.587Z
authors: agent
files:
---

# Evidence form / collapse-record-read

## current_situation

A record is read from one path, and the git retrieval is gone.

WHAT readItRecord DID BEFORE: three places for one file. If the record was open it read the record's own worktree; otherwise it tried trunk; and failing that it ran `git show <branch>:<rel>` and parsed the output.

THE ANSWER DEPENDED ON WHICH OF THE THREE HAPPENED TO HAVE IT. That is the retrieval path this whole iteration exists to delete, and keeping the archive on disk is what makes deleting it possible.

## built

engine/iterations.ts, readItRecord.

IT IS THREE LINES NOW: build the path under the root, return undefined if it is not there, read its frontmatter. No branch, no spawn, no parse of git output.

WHAT WENT WITH IT: the `spawnSync("git", ["show", ...])` call and its 8 MB buffer, and `parseStateNote` on a git stdout.

MEASURED: run test-msviovga-26, 21 of 21, including the archive cases in worktree.test.ts.

## follow_up

- THE BATCHED cat-file IN expmachine.ts IS STILL THERE. req-a-closed-records-folder-stays-on-trunk names it as one of the reads that stops being needed. It serves the EXPEDITION archive, which still lives on branches, so it is out of i34's scope and named rather than missed.
- THIS CHUNK NEEDED NO PASS OF ITS OWN. It fell out of level-records: once the seed writes to trunk and the list reads folders, there is only one path a record can be at, and the other two branches of readItRecord were unreachable code.
- NEXT IS close-leaves-the-folder, which is already built and owes only its evidence.

## anything_else

WHAT THIS DELETES THAT WAS NEVER BUILT, and it is worth recording because the design existed in full.

A MANIFEST OF CLOSED RECORD TO COMMIT HASH was designed earlier the same day, to let the archive find a record that had been removed from the tree. Keeping the archive on disk removes the question rather than answering it.

THE OWNER MADE THAT CALL IN ONE SENTENCE: "What if we also keep the archive on disc?" The manifest, the stored hash and the git read path all went with it, and none of them was ever written.
