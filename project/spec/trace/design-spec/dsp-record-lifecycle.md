---
minted_in: i1
id: dsp-record-lifecycle
type: "[[design-spec]]"
statement: records seeded, bound, landed and archived, carried by one worktree per open record and generated container machines
realizes:
  - "el-record-store"
  - "if-front-desk-to-record-store"
files:
  - "project/deliverable/engine/iterations.ts"
  - "project/deliverable/engine/claims.ts"
  - "project/deliverable/engine/worktree.ts"
---

## Responsibility

A record opens on the person's word, minted from templates with its own
worktree and branch. Entering binds; the pinned column compiles the
walk live; landing merges forward with a fresh green demanded; closing
refuses loose ends; the archive lists every closed record as it closed.
The container machines — iterations, expeditions, archives — generate
from what stands on disk.

## Behavior and constraints

- Two open records never share a tree.
- The pin records the demands ledger; the machine itself is never
  stored.
- The layout places a fallback state beside the state it recovers.
