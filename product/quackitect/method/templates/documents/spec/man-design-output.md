---
id: man-design-output
type: manifest
mode: chapter
order: 40
statement: Design output - the architecture derived, then the design deep down.
---
<!-- design: method-ch4-mech  implements: req-chapters-canned.3, req-decision-rendering.2 :: ch4 is mechanized, current-state only, with TWO spine subchapters. Part A is ARCHITECTURE. It contains the structural-models section as ONE auto-generated table, a row per declared model, with the figure and its derived informed-by decision links in the row expand. It also contains the partitioning onion with interface connections and tagged force-rationales, and the type-gated budgets. Part B is DETAILED DESIGN: the auto-generated design-regions table, a row per design element, responsibility brief-promoted, with the expand carrying file and implements links, plus the design rules view. Ledes are canned, and every figure line is its own unit. The drivers table, the generated asr-list figure, and the kind examples render with the appendix guidance. The candidates matrix and the decision tables live with the project chapter, since the design chapter documents what IS and the project chapter documents how it came to be. The authored residue is the type-gated budgets unit. What we built. -->
## What we built
<!-- tailor: shipped text - the chapter mechanics are the same in every project.
Sources: architecture vs design table @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
This chapter documents the design as it stands, in two parts: part A the architecture, part B the detailed design. How each choice was made - the deciding records and the candidates they weighed - lives with the [project chapter](man-project); every element here links there. The sorting rule for everything here: a decision is ARCHITECTURAL if it has system-wide impact or affects an important quality - otherwise it is detailed design.
---
## Architecture
<!-- tailor: shipped text - part A: the architecture, described by its models. Every
  declared structural model renders from its authored truth and carries a derived
  "informed by" list - the architecture decisions that name the model, its kind, or
  its elements. Decisions not informing a model stay out; the full record rides the
  project chapter's iteration timeline.
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
---
fig: onion
---
![[interfaces.base]]

![[force-rationales.base]]
---
### Structural models
<!-- tailor: shipped machinery - the section is ONE auto-generated table
  (the models-table figure unit): a row per declared model, the extracted figure and the
  derived informed-by links inside the row expand. The kind registry's compact
  examples render with the appendix guidance.
-->
<!-- ai:3 -->
Each declared model is one row below, rendered from its authored truth - expand a row for the figure and the decisions that informed it. The onion above renders the layer map directly. The compact examples of every supported model kind live with the appendix guidance.
---
fig: models-table
---
### Budgets
<!-- fill [type: manufactured_good, cyber_physical]
Contents: one line introducing the budget items - each bud- note carries the
  metric, unit, the requirement it serves, the AGREED summation rule, the margin,
  and the allocations map; the engine checks the arithmetic.
Motivation: suppliers game rss summation to hide overruns - the rule is part of
  the budget or the budget is theater. Margin erosion flags before overrun does.
Form: one prose line; the budget tables render derived.
Sources: budgets, summation rules @[[ref-systementwurf-mechatronik]].
-->
<!-- ai:3 -->
{{budgets}}
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
<!-- Trace coverage (requirement x implementing design, empty row = hole) renders
     from the graph - quack lint computes it; no authored unit. -->
<!-- enddesign -->
