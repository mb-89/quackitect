---
id: man-ch4-design-output
type: manifest
mode: chapter
order: 40
statement: Design output - the architecture derived, then the design deep down.
---
<!-- design: method-ch4-mech  implements: req-chapters-canned.3, req-decision-rendering.2 :: ch4 mechanized, current-state only: canned ledes, every figure line its own unit, the ASR list GENERATED from the architecturally-significant tag as links back to design input (never copied quality text), partitioning as the layered onion figure with interface connections and tagged force-rationales, the design rules view; the candidates matrix and the decision tables live with the project chapter (the design chapter documents what IS, the project chapter how it came to be); the authored residue is the type-gated budgets unit. -->
## What we built
<!-- tailor: shipped text - the chapter mechanics are the same in every project.
Sources: architecture vs design table @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
This chapter documents the architecture as it stands - part A the architecture and its drivers, part B the detailed design. How each choice was made - the deciding records and the candidates they weighed - lives with the [project chapter](man-ch6-project); every element here links there. The sorting rule for everything here: a decision is ARCHITECTURAL if it has system-wide impact or affects an important quality - otherwise it is detailed design.
---
## Drivers
<!-- tailor: shipped machinery - the architecturally-significant list GENERATES from
  the `architecturally-significant` tag on requirement nodes: each entry is a LINK
  back to design input, never a copy; tagging is
  owner curation. The strategy and architecture decision tables render in the
  project chapter (current state here, the record there).
Sources: drivers @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
The requirements below drove the architecture - each entry links back to its register row. The strategic choices they led to are decisions, recorded with the project chapter's timeline.
---
fig: asr-list
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
## Budgets
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
## Design rules
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
