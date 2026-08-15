---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: if-satellite-supervisor-to-record-store
type: "[[interface]]"
statement: When a record closes, the supervisor reaps its satellite first and releases the worktree second, so nothing holds a tree open that the close is trying to remove.
source: el-satellite-supervisor
destination: el-record-store
carries:
  - flow-closed-record
  - flow-worktree
form: call
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-archive-releases-worktrees
---

The order is the interface: reap, then release. A live process holding a
working directory inside the tree being removed is the failure
cand-os-rooted was marked down for and never connected to its close.

## The sequence

- The record closes. The store says so.
- The supervisor stops that record's satellite and waits for it to be gone.
- Only then does the store release the worktree.
- The branch stays. What is removed is the working copy, and the record is
  retrievable from the repository alone afterwards.

## It runs after the strays commit

Never before. Removing a working copy
that still holds unlanded work destroys it, and req-no-agent-act-destroys-work
forbids that outright.
