---
statement: DSM partitioning (triangularization/sequencing) - reorder a DSM's rows and columns to push dependencies to one side of the diagonal, exposing a dependency layering or sequence.
applies_chapters: [design-output]
applies_type: [default]
applies_rigor: [systematic]
source: ref-structural-complexity-management
aliases: [DSM partitioning, triangularization]
---
## Situation
Reach for it once a [DSM](meth-dsm) exists and the question is "what must be built or decided before what" - a topological order, or the closest achievable thing to one.
## Effect
A fully triangularizable DSM has no feedback loops (a DAG has a valid topological order). When cycles exist, the operation instead minimizes what is left in the lower triangle and pulls the unavoidable reach-backs as close to the diagonal as possible - the shortest possible rework loops. Identifying strongly-connected parts falls out as a side effect. Standard deterministic algorithms (Kusiak et al. 1994; Kusiak 1999; Gebala & Eppinger 1991) give sub-optimal results when feedback loops overlap.
## Procedure
Reorder rows/columns with a deterministic reachability-based algorithm; where loops still overlap, fall back to exhaustive permutation on the small, highly-interrelated cyclic residual only - not the whole matrix.
## Tools
Quackitect's onion "layer" concept is exactly this DSM operation applied to the design-region graph: a valid topological order when the graph is acyclic, or the closest-to-acyclic order plus the explicit minimal cycle set (see [DSM tearing](meth-dsm-tearing)) otherwise.
