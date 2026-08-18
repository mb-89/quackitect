---
form: close-leaves-the-folder
by: agent
signed_off: 2026-08-16T08:05:42.649Z
authors: agent
files: null
---

# Evidence form / close-leaves-the-folder

## current_situation

A close stamps the record and stops there. The folder stays.

WHAT itCloseShipped DID BEFORE: settle trunk strays, stamp the status inside the record's worktree, commit there, merge the branch to trunk, run `git rm -r` on the record's directory, and remove the worktree.

THE LINE THAT MATTERED carried its own reason: "CLOSED RECORDS LIVE IN GIT (owner ruling 2026-07-28): history is git's; the tree carries only live work." That ruling is reversed by i34.

## built

engine/worktree.ts, itCloseShipped.

WHAT IS LEFT: settle the strays, stamp `status: shipped` and `closed:` on the record, commit. Three acts, all on the one tree.

WHAT WENT: the merge, the `git rm -r` on the record directory, and the worktree removal. There is no branch to merge from and no worktree to remove, and the folder is what the archive reads.

THE PATH MOVED FROM rec.path TO root, which is the same thing now and will keep being the same thing when the last worktree goes.

MEASURED: run test-msviovga-26, 21 of 21. The check — a closed record's folder stays in the working tree — was red at observe-red and is green.

## follow_up

- mergeAndRetire STILL EXISTS AND STILL RETIRES, for expeditions. expClose calls it and expeditions still live on branches with worktrees. i34's scope is iterations and the archive, so the function stays and its iteration caller is gone.
- THE COST IS ON THE REQUIREMENT NODE rather than discovered later: closed records stay in the working tree forever, so the tree grows with every iteration. Measured against it, the whole spec tree is 2,138,305 bytes across 796 files and a finished record is well under a megabyte.
- NEXT IS delete-the-seam, the last real code chunk.

## anything_else

THIS IS THE CHUNK THE WHOLE ITERATION TURNS ON, and it is four lines.

EVERY OTHER PIECE FOLLOWS FROM IT. If a closed record's folder stays, the archive reads it from disk; if the archive reads from disk, no manifest is needed; if no manifest is needed, the git retrieval path goes; and if nothing reads a record out of git, nothing needs a branch per record.

THE OWNER FOUND IT BY ASKING ONE QUESTION: "What if we also keep the archive on disc?" The answer removed a design that had just been worked out in full.
