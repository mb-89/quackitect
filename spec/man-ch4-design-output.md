---
id: man-ch4-design-output
type: manifest
mode: chapter
statement: Design output - the architecture derived, then the design deep down.
---
## What we built, and how we chose it
<!-- tailor: shipped text - the chapter mechanics are the same in every project.
Sources: architecture vs design table @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
This chapter derives from the decisions, candidates, and design elements - part A is the architecture and how it was chosen, part B the detailed design. The sorting rule for everything here: a decision is ARCHITECTURAL if it has system-wide impact or affects an important quality - otherwise it is detailed design.
---
## Drivers and strategy
<!-- tailor: shipped machinery - the ASR view derives the drivers (high-weight rows
  AND quality rows); the strategy choices are decisions tagged strategy, the
  approach style among them (one dec- note).
Sources: drivers, approach styles @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
The rows below drove the architecture. Each strategic choice is a decision naming the goal or quality it serves.

![[asr.base]]

![[decisions-strategy.base]]
---
## The solution space
<!-- tailor: shipped machinery - candidates are items, the matrix renders them
  against the criteria, the deciding records own the verdicts. This view replaces
  hand-written Pugh tables. Anti-bias discipline lives in the decision records:
  weights fixed BEFORE options are scored; a question mark is a legal verdict.
Sources: anti-bias @[[ref-methodische-entwicklung]]; FRAME @[[ref-sya-tactics]].
-->
<!-- ai:3 -->
Every decision axis ran its candidates against the weighted criteria. The matrix derives from the candidate notes; the verdicts derive from the deciding records.
---
fig: candidates-matrix
---
## Partitioning and interfaces
<!-- tailor: shipped machinery - the tree derives from the design elements (code
  markers and des- notes), interfaces are connection notes of kind interface, the
  winning forces are rationale notes tagged partitioning-force.
Sources: partitioning forces, block description @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
The element tree below derives from the design elements. Each interface is a connection with its contract one click away; the forces that shaped the cut render beneath it.
---
fig: block-tree
---
![[interfaces.base]]

![[force-rationales.base]]
---
## Decisions
<!-- tailor: shipped machinery - the architecture decisions view; waivers render
  in verification and validation, project decisions in the project chapter.
Sources: every decision names the requirement it addresses @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
Without decisions there is no architecture. Every decision below names the requirement it addresses; the rejected candidates keep their reasons.

![[decisions-architecture.base]]
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
