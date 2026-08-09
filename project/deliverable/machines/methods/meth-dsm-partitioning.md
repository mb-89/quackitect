---
kind: method
statement: "DSM partitioning reorders rows and columns to push dependencies to one side of the diagonal. It exposes a dependency layering or sequence."
source: ref-structural-complexity-management
---

## Situation

Reach for it once a [DSM](meth-dsm) exists and the question is what must be
built or decided before what.

The answer is a topological order, or the closest achievable thing to one.

## Effect

A fully triangularizable DSM has no feedback loops. A DAG has a valid
topological order.

When cycles exist, the operation minimises what is left in the lower triangle.
It also pulls the unavoidable reach-backs as close to the diagonal as it can,
which makes the rework loops as short as possible.

Identifying strongly-connected parts falls out as a side effect.

Standard deterministic algorithms give sub-optimal results when feedback loops
overlap. The source names three:

- Kusiak et al. 1994.
- Kusiak 1999.
- Gebala and Eppinger 1991.

## Procedure

Reorder rows and columns with a deterministic reachability-based algorithm.

Where loops still overlap, fall back to exhaustive permutation. Run it on the
small, highly-interrelated cyclic residual only, never on the whole matrix.
