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
