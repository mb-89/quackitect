---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: if-satellite-supervisor-to-satellite
type: "[[interface]]"
statement: The supervisor owns a satellite's start, replacement and reaping, and never hands over a half-ready one.
source: el-satellite-supervisor
destination: el-satellite
carries:
  - flow-compiled-machine
  - flow-position
  - flow-worktree
form: process control
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-entry-levels-the-record-tree
  - req-an-engine-change-applies-in-its-own-record
---

Process control rather than a call, which is what makes it an interface with
teeth. Four acts cross it and each is all-or-nothing.

## Start

The supervisor levels the record's tree, reconciles its delta on trunk,
commits what it brought, composes the machine, and only then hands the
satellite its three things and lets it serve. A conflict at any step means no
satellite starts and the record stops at entry with the conflict named.

## Replace

The engine delta changed. The supervisor composes again, brings a
replacement up, and retires the old one. The agent performs nothing and waits
for nothing they can see, because the walk recomputes its position from the
repository rather than holding it in the process.

## Reap

The record closed. The satellite goes and the worktree is released.

## What this interface does not yet say

It is the architecture's one open
question: what happens to a call in flight when a satellite dies rather than
being retired. Retirement is orderly and death is not. No single-process line
ever had to answer this and this one must.
