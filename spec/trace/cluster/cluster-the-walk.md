---
minted_in: i1
id: cluster-the-walk
type: "[[cluster]]"
name: the machine the walk runs on, and the one governed step it serves at a time
coupling: shared-data
source_refs:
  - the function DSM at M4 partition-functions, 2026-08-09
  - the function DSM at M4 partition-functions, 2026-08-18
---

## Rationale

Three of the original four are bound by one flow. The compiled machine comes out of
holding the method, and both serving a step and judging a claim consume it.
Nothing else in the tree reads it except the tour.

THE FOURTH IS A JUDGMENT. Catching the system up shares no flow with the
other three, but it reads the same method sources that holding the method
reads, and it exists because the method moves faster than the system follows.
It is the same material seen from the other end.

A candidate that allocates the sweep away from the compiler is not thereby
wrong. The tie is real and it is the thinnest in this cluster.

## Two more arrived after that was written, and it is now six

THE TEXT ABOVE DESCRIBES FOUR MEMBERS. `guard-a-write` and `resolve-a-path`
joined later, and the count above is left standing as the original judgment
rather than rewritten over.

BOTH STRENGTHEN THE CLASS RATHER THAN STRAINING IT. The cluster was bound by
one flow and is now bound by three, all of them internal.

- `serve-a-step` produces the dispatched call, which `guard-a-write` and
  `resolve-a-path` both consume.
- `resolve-a-path` produces the resolved target, which `hold-the-method`
  consumes.
- `hold-the-method` produces the compiled machine, which `serve-a-step` and
  `judge-a-claim` consume.

SO THERE IS NOW A CYCLE, and it is the only one in the whole matrix: serving a
step resolves a path, resolving a path reaches the held method, and the held
method is what serving a step runs on. A cycle cannot be cut into stages, which
is the strongest form this coupling takes.

## What i16 changed here

IT ADDED NO MEMBER. `resolve-a-path` gained three requirements and stayed where
it was.

WHAT THE THREE ADD IS A THIRD SOURCE OF TRUTH. The function already consulted
the bound record and the path's own kind. It must now also follow a pointer
recorded in a tree that carries none of the system's method, which is
[[req-the-system-runs-in-a-tree-that-is-not-its-own]].

AND THAT MAKES ONE NEW CROSS-CLUSTER EDGE, from `bring-forth-a-project` in
[[cluster-the-bootstrap]] to `resolve-a-path` here, carried by
`flow-driven-tree`. It is the one seam this iteration cut across the partition,
and every candidate has to place it somewhere.
