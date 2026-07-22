---
id: se.meth-dsm
kind: method
statement: DSM - represent one domain's elements as a square, directed dependency matrix (row affects column); the base representation every structure-analysis operation below reads.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_applies_chapters:
  - design-output
v1_applies_type:
  - default
v1_applies_rigor:
  - systematic
v1_source: ref-structural-complexity-management
v1_aliases:
  - Design Structure Matrix
  - Dependency Structure Matrix
---

## Situation
Many elements, directed dependencies between them, and coupling that has so far only been eyeballed off a diagram. Reach for it whenever a grouping, layering, or tearing decision needs data instead of intuition.
## Effect
Turns coupling into a data structure every downstream operation (clustering, partitioning, tearing, banding) reads. A filled cell means "row affects column"; a bi-directional dependency needs two mirrored cells. Steward coined the term in 1981 analyzing a design process's information flow; Browning's classification splits component/architecture DSMs and parameter DSMs (analyzed by clustering) from activity/schedule DSMs (analyzed by sequencing).
## Procedure
List the domain's elements once, in the same order on rows and columns. Blacken the diagonal (self-reflexive). Mark a cell where the row element depends on the column element - binary existence, or a weighted value. Keep ONE dependency meaning per matrix: if more than one relation kind exists (e.g. "reads-from" and "calls"), model each as its own DSM subset rather than overlaying them into one binary matrix - mixing meanings breaks every analysis that reads the matrix afterward.
## Tools
Quackitect's region x region a-to-b flow graph (the structural model, i16) already IS a DSM: regions are the elements, directed flows are the dependencies. No separate elicitation step - the existing model export is the matrix.
