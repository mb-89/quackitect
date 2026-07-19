---
id: guide-structuring-methods
type: guide
audience: developer-maintainer
statement: Structuring a design with matrix methods. DSM clustering, partitioning, tearing, and banding, plus the DMM and MDM maps.
class: review
killer: false
---
Grouping elements into cohesive modules, or reordering them into a dependency layering, MAY draw on matrix-based structuring methods rather than eyeballing the cut alone:

- Represent the coupling as a [DSM](meth-dsm).
- [Cluster](meth-dsm-clustering) it to find candidate modules.
- [Partition](meth-dsm-partitioning) it to find a layering.
- [Tear](meth-dsm-tearing) the residual feedback edges to prioritize them.
- [Band](meth-dsm-banding) the partitioned result to expose within-layer parallelism.
- Mapping this structure against another domain (e.g. requirements) reaches for a [DMM](meth-dmm).
- Deriving one domain's structure from others already elicited reaches for an [MDM](meth-mdm).

The catalog comes from [Structural Complexity Management](ref-structural-complexity-management) (Lindemann, Maurer, Braun), citing Pimmler & Eppinger's canonical clustering example and Thebeau's search heuristic.
