---
id: man-ch6-project
type: manifest
mode: chapter
order: 60
statement: Project - the approach, the record, and the risks, mostly derived.
---
## How this project runs
<!-- tailor: shipped text - the chapter derives from the ledger; only the
  approach paragraph below is authored.
-->
<!-- ai:3 -->
This chapter is mostly the [ledger](term:ledger), rendered: the decisions, the [iteration](term:iteration) timeline, the risk register, and the baseline identity. One authored paragraph states the approach; everything else derives - nothing here is restated by hand.
---
## Approach and project decisions
<!-- fill [mandatory]
Contents: one authored strategy paragraph (cadence, approach); the TAILORING
  RECORD is the anchor row of the decisions view - which rigor, which type, why
  this much documentation, plus every skip-with-reason from the gating tags.
Motivation: documentation right-sized ON PURPOSE, reason recorded - the field
  lesson. Roles appear as roles, never persons.
Form: one paragraph, then the derived view. Rigor and type derive from the
  iterations - state nothing derivable.
Sources: right-sizing @[[ref-se-thinking-learning]]; fixed skeleton, plug-in
  tailoring @[[ref-generic-se]].
-->
<!-- ai:3 -->
The project runs in short iterations, each walked through its [milestone](term:milestone) gates: the agent fills the checks, the owner adjudicates. Documentation is sized deliberately full: this book is the project's own product demonstration, so the whole spec template applies - anything less would leave the template unproven. Two type-gated units are skipped with their tags recorded: budgets and physical verification records serve manufactured and cyber-physical deliverables, not software.

![[decisions-project.base]]
---
## Milestones and timeline
<!-- tailor: shipped text - the project table carries each iteration's gate tally.
  The walk is the truth; the table says it without a graph (DRY, field c41). Since
  the bs20 ruling (2026-07-08) each iteration row expands to its decisions and the
  candidates they weighed - the record of how the architecture came to be lives
  HERE; the design chapter shows only what stands.
-->
<!-- ai:3 -->
The table carries every iteration - history and planned - with its gate tally, live from the ledger. Expand an iteration to reach its decisions and the candidates they weighed.
---
fig: project-table
---
## Design decisions
<!-- tailor: shipped machinery - the strategy and architecture decision views moved
  here from the design chapter (bs20 ruling: current state there, the record here);
  waivers stay with verification and validation.
Sources: every decision names the requirement it addresses @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
Without decisions there is no architecture. Every decision below names the requirement it addresses; the rejected candidates keep their reasons, reachable from the timeline above.

![[decisions-strategy.base]]

![[decisions-architecture.base]]
---
## Risks, assumptions, issues, dependencies
<!-- tailor: shipped text - the register derives from the raid notes; the context
  unit of design input renders the assumption rows (one source, two views).
Sources: reduction order, triple scoring @[[ref-methodische-entwicklung]].
-->
<!-- ai:3 -->
Every row carries probability and impact, a mitigation in avoid-then-detect-then-limit order, an owning role, and a status. An unrecorded assumption is how orbits get lost - record it, and the register cannot forget it.

![[raid.base]]
---
## Baselines and change control
<!-- tailor: shipped text - the identity stamp and the ledger carry the specifics;
  the prose is the same in every project.
Sources: baselines @[[ref-modellbasierte-pe]]; change discipline @[[ref-pahl-beitz]].
-->
<!-- ai:3 -->
The identity stamp in this document's header names the exact baseline rendered: the source state, the iteration, the engine version. The change history lives in the ledger and renders from it - this section never restates it. Strike-through-never-delete is a property the ledger enforces, not a discipline the reader must trust.
---
## Methods that apply here
<!-- tailor: shipped machinery - method notes route themselves by applies_chapters.
-->
![[methods.base#Methods for project]]
