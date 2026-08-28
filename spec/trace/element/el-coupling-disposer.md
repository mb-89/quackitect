---
unreachable_refs:
  - cand-explicit-and-safe
minted_in: i15-the-database-our-own-reader-over-obsidia
id: el-coupling-disposer
type: "[[element]]"
statement: Ranks candidate couplings against a described change and records a disposition for each one, stamped pending before any person looks at it.
kind: new
realization: make
group: the-disposition
implements:
  - fn-run-a-governed-walk.rank-candidate-couplings
  - fn-run-a-governed-walk.record-a-coupling-disposition
source_refs:
  - raid-dec-i15-disposition-prepopulates-pending-rows
  - opt-prepopulate-pending-disposition-rows
  - cand-explicit-and-safe
---

## What it does

Scores candidate coupled nodes against a change description and, the
moment the ranked list is produced, writes one disposition row per
candidate stamped `pending` — no threshold, no auto-classified band. A
person clears each row explicitly, the same shape el-walk-engine already
uses for judging a gate claim.

## What crosses its boundary

Both flows cross the system boundary directly: flow-change-description
in from the caller, flow-coupling-disposition out. flow-candidate-list
is internal — produced by the ranking half and consumed by the
disposition half inside this one element, so it crosses no element
boundary and owes no interface. Both new functions land on one element
because cluster-the-disposition's own DSM coupling (sequence, one flow,
one edge) is exactly this seam.

## Realization concept

A ranking pass (the requirement register already names BM25
specifically for it) plus a disposition-row writer that runs before any
review happens, reading the same trace corpus el-query-evaluator reads.
