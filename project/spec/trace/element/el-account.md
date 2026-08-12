---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: el-account
type: "[[element]]"
statement: Keeps the record of what happened — every call logged with role and channel, the trace derived from files, findings landing as references with their sources.
kind: existing
realization: make
group: the-account
implements:
  - fn-run-a-governed-walk.keep-the-record
source_refs:
  - cand-thin-worktree
  - raid-dec-stable-ids
---

The account is append-only fact: the call log, the trace corpus and the
reference corpus. Ids point at authoritative text
([[raid-dec-stable-ids]]); the trace view derives from files and never
mixes sources.

Boundary: the interfaces the element matrix mints for its flows.

Realization: the call log, the trace loader and the reference store.
