---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: cluster-the-query
type: "[[cluster]]"
name: reading the corpus's own structure back as typed rows, apart from the walk
coupling: same-external-interface
source_refs:
  - the function DSM at M4 partition-functions, 2026-08-16
---

## Rationale

ONE FUNCTION, AND IT COUPLES TO NOTHING IN THE EXISTING TREE. That is the
finding, not an embarrassment — the same shape as cluster-the-bootstrap.

answer-a-structured-query sits on a new surface: a structured query asked of
the corpus, answered with named fields or an explicit empty result. Every
other function in the tree is reached through the walk's own call dispatch
(flow-dispatched-call, serve-a-step). This one is not — it answers directly,
without touching a record or a claim.

That is a different EXTERNAL INTERFACE, not a missing edge. Folding it into
an existing cluster to avoid a singleton would assert a coupling the matrix
does not show.
