---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: cluster-the-disposition
type: "[[cluster]]"
name: ranking a candidate coupling against a change, then recording what became of it
coupling: sequence
source_refs:
  - the function DSM at M4 partition-functions, 2026-08-16
---

## Rationale

Confirms the matrix proposal without departure. rank-candidate-couplings
produces flow-candidate-list; record-a-coupling-disposition consumes it and
nothing else does. One flow, one edge, one pipeline: rank then record, in
that order, every time.

Split into two functions rather than one because rank is a read over the
corpus and record is a judgment about each result — see each function's own
Rationale. The cluster keeps them adjacent because the second cannot run
before the first, and nothing else stands between them.
