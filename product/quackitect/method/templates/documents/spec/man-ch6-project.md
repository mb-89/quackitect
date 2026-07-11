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
This chapter is mostly the ledger, rendered:

<!-- ai:3 -->
- the decisions
- the iteration timeline
- the risk register
- the baseline identity

<!-- ai:3 -->
One authored paragraph states the approach; everything else derives - nothing here is restated by hand.
---
## Approach
<!-- fill [mandatory]
Contents: one authored strategy paragraph (cadence, approach); the TAILORING
  RECORD is a project-kind row of the ONE decisions table below - which rigor,
  which type, why this much documentation, plus every skip-with-reason from the
  gating tags.
Motivation: documentation right-sized ON PURPOSE, reason recorded - the field
  lesson. Roles appear as roles, never persons.
Form: one paragraph; the decisions render in the one table below. Rigor and
  type derive from the iterations - state nothing derivable.
Sources: right-sizing @[[ref-se-thinking-learning]]; fixed skeleton, plug-in
  tailoring @[[ref-generic-se]].
-->
<!-- ai:3 -->
{{approach}}
---
<!-- design: des-ch6-table-only  implements: req-decision-rendering.1 :: ch6 renders the milestones and the decisions as tables only, never a graph; the milestones are SLIM - timeline order and name, a short introduction one expand away - and every decision lives in the ONE decisions table below. -->
## Milestones and timeline
<!-- tailor: shipped text - the walk is the truth; the table says it without a graph
  (DRY). Slim: timeline
  order and the iteration name in the row, the expand a short introduction; the
  decisions live OUT in the one decisions table below, reachable through its
  iteration filter.
-->
<!-- ai:3 -->
The table carries every iteration - history and planned - in timeline order, live from the ledger. Expand an iteration for its short introduction; its decisions live in the one table below, filtered by iteration.
---
fig: project-table
<!-- enddesign -->
---
## Decisions
<!-- tailor: shipped machinery - ONE table for every project, strategy, and
  architecture decision: the TYPE a rendered
  column, pill facets over type and iteration, readable titles - never slug ids. The
  expand carries the rationale and the considered alternatives with their rejection
  reasons (q-candidates-placement, decided); waivers stay with verification and
  validation.
Sources: every decision names the requirement it addresses @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
Without decisions there is no architecture. One table carries every decision - filter by type or iteration. Expand a decision for its rationale, the requirement it addresses, and the alternatives it weighed with their rejection reasons.
---
fig: decisions-table
---
## Risks, assumptions, issues, dependencies
<!-- tailor: shipped text - the register derives from the raid notes; the context
  unit of design input renders the assumption rows (one source, two views).
Sources: reduction order, triple scoring @[[ref-methodische-entwicklung]].
-->
<!-- ai:3 -->
Every row carries:

<!-- ai:3 -->
- probability and impact
- a mitigation, in avoid-then-detect-then-limit order
- an owning role
- a status

<!-- ai:3 -->
An unrecorded assumption is how orbits get lost - record it, and the register cannot forget it.

![[raid.base]]

<!-- No "methods that apply here" section:
     mention an applicable method in the PROSE as a link - the full
     methods consolidate in the appendix. -->
<!-- No "Baselines and change control" section: the identity stamp and the ledger
     carry the specifics; the prose is maintainer guidance - a guides-table row
     (guide-baselines-and-change-control), never a reader subchapter. -->
