---
id: se.meth-dsm-clustering
kind: method
statement: DSM clustering - search cluster (module) assignments over a DSM that maximize intra-cluster and minimize inter-cluster dependency, exposing candidate architecture modules.
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
  - DSM clustering
  - IGTA
---

## Situation
Reach for it once a [DSM](meth-dsm) exists and the open question is "which elements form a cohesive module" - the M3/M4 grouping call that is otherwise pure judgment.
## Effect
Turns "this element sits here because it's tightly coupled to these" into a computed answer: a cluster is a defensible module boundary because an edit to one element inside it mostly stays inside it. High internal density, low external density is the informal objective; the book links it to the strongly-connected-component criterion (all nodes mutually reachable implies internal connectivity is at least external) and to a similarity criterion. No ready-to-run algorithm is given in the source - it names the field's canonical worked example (Pimmler & Eppinger 1994: a 16-element automotive climate-control-system DSM, clustered into both product modules and the matching team/organization structure) and the research that supplies the actual objective and search.
## Procedure
Run a cost/bid stochastic hill-climb over cluster assignments (Thebeau 2001's IGTA-style search), or a comparable heuristic (Fernandez 1998; Yu et al. 2003's genetic-algorithm-plus-Minimum-Description-Length formulation, which also separates cluster elements from cross-cutting "bus" elements) that maximizes intra-cluster and minimizes inter-cluster coupling. Manual/spreadsheet realignment tops out around ~30 elements - past that, automate the search.
## Tools
Quackitect can compute a DSM of the design regions from the existing flow graph and propose clusters - validating or improving hand-authored band allocations and auto-generating each element's placement rationale (seed notes NOTE-20260711-222657, NOTE-20260711-222841; the Cambridge Advanced Modeller tool implements this family of algorithm and is a candidate to integrate or draw the method from).
