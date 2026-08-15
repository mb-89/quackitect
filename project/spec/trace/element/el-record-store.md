---
minted_in: i1
id: el-record-store
type: "[[element]]"
statement: Holds the records — binds a thin worktree per open record, lands finished work on trunk, closes records clean and keeps the archive readable.
kind: existing
realization: make
group: the-record-life
implements:
  - fn-run-a-governed-walk.hold-the-work
  - fn-run-a-governed-walk.land-the-work
  - fn-run-a-governed-walk.close-a-record
  - fn-run-a-governed-walk.keep-the-archive
source_refs:
  - cand-thin-worktree
  - raid-dec-thin-tree
---

The record life's substrate: git worktrees and branches, one per open
record, each holding ONLY the record's own folder ([[raid-dec-thin-tree]]).
Landing is one piece onto trunk with a fresh green; closing refuses loose
ends; the archive lists every closed record as it closed, read-only.

Boundary: the interfaces the element matrix mints for its flows.

Realization: git supplies isolation and history; the store logic is ours.
