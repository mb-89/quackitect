---
id: man-ch4-design-output
type: manifest
mode: chapter
order: 40
statement: Design output - the architecture derived, then the design deep down.
---
## What we built
<!-- tailor: shipped text - the chapter mechanics are the same in every project.
Sources: architecture vs design table @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
This chapter documents the design as it stands, in two parts: part A the architecture, part B the detailed design. How each choice was made - the deciding records and the candidates they weighed - lives with the [project chapter](man-ch6-project); every element here links there. The sorting rule for everything here: a decision is ARCHITECTURAL if it has system-wide impact or affects an important quality - otherwise it is detailed design.
---
## Architecture
<!-- tailor: shipped text - part A: the architecture, described by its models. Every
  declared structural model renders from its authored truth and carries a derived
  "informed by" list - the architecture decisions that name the model, its kind, or
  its elements. Decisions not informing a model stay out; the full record lives in
  the project chapter's one decisions table.
Sources: architecture views @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
The architecture is the set of choices with system-wide reach: how the system splits into parts, what may depend on what, and which qualities the split protects. It renders below as models, each derived from its authored source. Every model links the decisions that informed it - the reasons it is the way it is.
---
### Partitioning and interfaces
<!-- tailor: shipped machinery - the onion derives from the design elements (code
  markers and des- notes) plus the project's layer map (design-layers.md: the one
  judgment input - inputs enter, travel through the layers, outputs leave; the
  blocks sit on the rings they work in; iteration files stay excluded - the book
  documents the current design). A reader clicks a block to enter it, breadcrumbs
  lead back up, each leaf links to its trace item. Interfaces are connection notes
  of kind interface, the winning forces are rationale notes tagged
  partitioning-force.
Sources: partitioning forces, block description @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
The layered figure below derives from the design elements and the layer map. Enter a layer by clicking it; the breadcrumbs lead back; every leaf links to its trace item. Each interface is a connection with its contract one click away; the forces that shaped the cut render beneath it.

<!-- ai:3 -->
Grouping elements into cohesive modules, or reordering them into a dependency layering, MAY draw on matrix-based structuring methods rather than eyeballing the cut alone: represent the coupling as a [DSM](meth-dsm), then [cluster](meth-dsm-clustering) it to find candidate modules, [partition](meth-dsm-partitioning) it to find a layering, [tear](meth-dsm-tearing) the residual feedback edges to prioritize them, and [band](meth-dsm-banding) the partitioned result to expose within-layer parallelism. Mapping this structure against another domain (e.g. requirements) reaches for a [DMM](meth-dmm); deriving one domain's structure from others already elicited reaches for an [MDM](meth-mdm). The catalog comes from [Structural Complexity Management](ref-structural-complexity-management) (Lindemann, Maurer, Braun), citing Pimmler & Eppinger's canonical clustering example and Thebeau's search heuristic.
---
fig: onion
---
![[interfaces.base]]

![[force-rationales.base]]
---
### Structural models
<!-- tailor: shipped machinery - the section is ONE auto-generated table
  (the models-table figure unit): a row per declared model, the extracted figure and the
  derived informed-by links inside the row expand (the onion above is the
  layers-flow model's own drill-down render). The kind registry's compact
  examples render with the appendix guidance; the check-state lifecycle example
  lives there too.
-->
<!-- ai:3 -->
Each declared model is one row below, rendered from its authored truth - expand a row for the figure and the decisions that informed it. The onion above is the layers-flow model's own drill-down render. The compact examples of every supported model kind live with the appendix guidance.
---
fig: models-table
---
## Detailed design
<!-- tailor: shipped machinery - part B: everything below the architectural line,
  as the auto-generated design-regions table (the design-regions figure unit): a row per
  design element - the code-derived regions and the des- notes - with the
  responsibility brief-promoted into the row; the expand carries the full
  responsibility, the file the region lives in, and the implements links. The
  design rules stay prose-introduced below.
-->
<!-- ai:3 -->
Below the architectural line sits the detailed design: choices with local reach, safe to revise inside one element. Each design element is one row below - expand it for the responsibility, the file it lives in, and the requirements it implements.
---
fig: design-regions
---
### Design rules
<!-- tailor: shipped machinery - the rules view; each rule is a note in spec/rules
  linking the decision that established it.
Sources: governance @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
Detailed design honors the rules below. A rule is internally chosen governance - drift against it is detectable because it is written.

![[rules.base]]

<!-- No "methods that apply here" section:
     mention an applicable method in the PROSE as a link - the full
     methods consolidate in the appendix. -->
<!-- Budgets skipped: the unit is gated [type: manufactured_good, cyber_physical]
     and this deliverable is software - the ch6 tailoring row records the skip. -->
<!-- Trace coverage (requirement x implementing design, empty row = hole) renders
     from the graph - quack lint computes it; no authored unit. -->
