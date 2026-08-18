---
minted_in: i1
id: dsp-record-lifecycle
type: "[[design-spec]]"
statement: records seeded, bound, landed and archived as folders on trunk, with generated container machines
realizes:
  - "el-record-store"
  - "if-front-desk-to-record-store"
files:
  - "project/deliverable/engine/iterations.ts"
  - "project/deliverable/engine/worktree.ts"
  - "project/deliverable/engine/seed.ts"
---

## Responsibility

A record opens on the person's word, minted from templates as a FOLDER
ON TRUNK. Entering binds; the pinned column compiles the walk live;
closing refuses loose ends; the archive lists every closed record as it
closed, and the folder stays where it is. The container machines —
iterations, expeditions, archives — generate from what stands on disk.

## Behavior and constraints

- ONE TREE, AND NO WORKTREE PER RECORD (i34). The statement and this
  line both said records were carried one worktree each, which stopped
  being true the day the seed stopped making them. What replaced the
  guarantee is an assumption with a trigger,
  raid-asm-only-one-agent-works-a-clone-at-a-time, rather than a lock.
- A SEED STATES ITS DEPENDENCY OR REFUSES (i6). Both seed verbs and the
  mirror's two seed forms hold to one demand, in `seed.ts`, so a person
  and an agent read the same remedy. An empty list is legal and is
  written out, because a silence and a decision must not be the same
  bytes on disk.
- The pin records the demands ledger; the machine itself is never
  stored.
- The layout places a fallback state beside the state it recovers.

## The close is the ruling

ENTERING AN EXPEDITION CREATES ITS RECORD, continuing binds the lane to it,
and the CLOSE IS THE RULING: apply merges the changes to trunk, dismiss
archives them unmerged.

EVERY EXPEDITION IS A FOLDER ON TRUNK, and open comes from its own status —
the same shape iterations took. Before that, the list came from `exp/*`
branches and open meant "a worktree directory exists". Both halves asked the
filesystem a question the record already answers.

THE RECORD'S FRONTMATTER COMES FROM THE ONE TREE. It used to come from three
places: the working copy while open, a merged copy on trunk, and failing both,
a read of the branch. Which one answered depended on what happened to exist.

THE BRANCH READ IS GONE. A closed expedition's record used to live on its
branch, so the reader fell back to reading that branch and cached the result
because a closed branch never moves. The archive lives on disk now, so the
folder is still there and there is nothing to retrieve.

## A disposition is agreed, never asserted

THE CLOSE IS HELD by any register entry still waiting for a ruling.

THE RULE FOR TELLING THEM APART: has somebody ruled on this entry, or is it
still waiting for one? `open` and `probed` are waiting — an assumption that
has been probed is still live, because the probe told you something rather
than disposing of it.

`accepted` AND `deferred` LOOK WRONG IN THE AGREED LIST AND ARE NOT. They
are exactly where a carried finding drifts, and both are real rulings: accepted
means somebody chose to live with it, deferred means somebody chose to move it.
Treating either as unresolved would make the close refuse work already ruled
on, which is what teaches people to stop using the bucket.

## A dirty trunk is settled first

FOUND LIVE, CLOSING AN EXPEDITION. A merge refuses to overwrite uncommitted
local changes, so the merge failed — and the abort that follows failed too,
because no merge had started. The record was already stamped closed by then,
leaving an expedition marked shut, unmerged, with its working copy still
standing.

THE CLOSE COMMITS THE ROOT'S STRAYS rather than refusing. It already does
exactly this on the other side of the merge, on the principle that a walk's
work never silently vanishes, and the root deserves the same.

NOT A STASH. A stash pop can conflict AFTER the merge has started, which
strands uncommitted work halfway through a close.

TRACKED CHANGES ONLY. Untracked files are left alone, so scratch files stay
out of it. An untracked file the incoming branch also creates still fails the
merge, which aborts cleanly and says so.

KEEPING TRUNK CLEAN IS WHAT KEEPS THE READ-PROOF HONEST. A dirty trunk is
exactly when the tree the lane serves and the tree the proof hashes drift
apart.
