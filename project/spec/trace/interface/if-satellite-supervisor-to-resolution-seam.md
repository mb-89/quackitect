---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: if-satellite-supervisor-to-resolution-seam
type: "[[interface]]"
statement: The supervisor tells the seam which tree a satellite is rooted at, once, at start — and the seam judges every later path against that one answer.
source: el-satellite-supervisor
destination: el-resolution-seam
carries:
  - flow-worktree
form: in process
source_refs:
  - decompose-structure, the element matrix's owed cell
  - opt-mark-the-tree-at-bind-while-intent-is-still-known
---

Stamped at start and never moved. The supervisor knows which record it is
bringing up, so it says so once, at the moment intent is still known.

## Why it cannot move afterwards

A root that changes mid-life is exactly the
failure this iteration was opened for: the same path meaning different stores
at different moments, with nothing saying which. A satellite serves one
record for its whole life, so its root is set once and a change means a new
satellite.

## Why the seam needs no binding logic

It compares a resolved path
against one fixed answer. That is the whole reason the seam is small enough
to be trusted.
