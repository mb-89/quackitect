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
This chapter documents the architecture as it stands - part A the architecture and its drivers, part B the detailed design. How each choice was made - the deciding records and the candidates they weighed - lives with the [project chapter](man-ch6-project); every element here links there. The sorting rule for everything here: a decision is ARCHITECTURAL if it has system-wide impact or affects an important quality - otherwise it is detailed design.
---
## Drivers
<!-- tailor: shipped machinery - the ASR view derives the drivers (high-weight rows
  AND quality rows); the strategy and architecture decision tables render in the
  project chapter (bs20 ruling: current state here, the record there).
Sources: drivers @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
The rows below drove the architecture. The strategic choices they led to are decisions, recorded with the project chapter's timeline.

![[asr.base]]
---
## Partitioning and interfaces
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
## Design rules
<!-- tailor: shipped machinery - the rules view; each rule is a note in spec/rules
  linking the decision that established it.
Sources: governance @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
Detailed design honors the rules below. A rule is internally chosen governance - drift against it is detectable because it is written.

![[rules.base]]

---
## Methods that apply here
<!-- tailor: shipped machinery - method notes route themselves by applies_chapters.
-->
![[methods.base#Methods for design-output]]

<!-- Budgets skipped: the unit is gated [type: manufactured_good, cyber_physical]
     and this deliverable is software - the ch6 tailoring row records the skip. -->
<!-- Trace coverage (requirement x implementing design, empty row = hole) renders
     from the graph - quack lint computes it; no authored unit. -->
