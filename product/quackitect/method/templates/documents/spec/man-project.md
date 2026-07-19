---
id: man-project
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
- the iteration timeline, decisions included
- the risk register
- the baseline identity

<!-- ai:3 -->
One authored paragraph states the approach; everything else derives - nothing here is restated by hand.
---
## Approach
<!-- fill [mandatory]
Contents: one authored strategy paragraph (cadence, approach); the TAILORING
  RECORD rides the project-kind decision nodes - which rigor, which type, why
  this much documentation, plus every skip-with-reason from the gating tags -
  reachable through the iteration timeline below.
Motivation: documentation right-sized ON PURPOSE, reason recorded - the field
  lesson. Roles appear as roles, never persons.
Form: one paragraph. Rigor and type derive from the iterations - state nothing
  derivable.
Sources: right-sizing @[[ref-se-thinking-learning]]; fixed skeleton, plug-in
  tailoring @[[ref-generic-se]].
-->
<!-- ai:3 -->
{{approach}}
---
<!-- design: des-ch6-table-only  implements: req-decision-rendering.1 :: the chapter renders the walk as the ONE shared timeline, never a graph. Each iteration opens to its milestones, each milestone to its tasks, each task to its evidence and the decisions it cites. The separate project table and decisions table are gone (owner ruling 2026-07-19): the timeline is THE iterations rendering, and it carries the decisions. -->
## The iteration timeline
<!-- tailor: shipped machinery - the shared timeline renderer (ONE component for
  the handover, the report, and the book; owner ruling req-project-timeline) in
  its BOOK frame: every iteration, width unconstrained, the current one open at
  its working milestone. The timeline is THE iterations rendering.
-->
<!-- ai:3 -->
Every iteration, oldest first, through the same timeline that drives the report and the handover. Open an iteration for its milestones; open a milestone for its tasks. The current iteration starts open.
---
fig: project-timeline
<!-- enddesign -->
---
## Risks, assumptions, issues, dependencies
<!-- tailor: shipped text - the register derives from the raid notes; the context
  unit of design input renders the assumption rows (one source, two views).
Sources: reduction order, triple scoring @[[ref-methodische-entwicklung]].
-->
<!-- ai:3 -->
The matrix plots every item: impact right, probability up, color by kind. The table sits beside it and follows the same filters. Click a bubble for the item's details; its row selects in the table - closed items start hidden. Expand a row for:

<!-- ai:3 -->
- probability and impact
- a mitigation, in avoid-then-detect-then-limit order
- an owning role
- a status

<!-- ai:3 -->
An unrecorded assumption is how orbits get lost - record it, and the register cannot forget it.
---
fig: raid-matrix
---

<!-- No "methods that apply here" section:
     mention an applicable method in the PROSE as a link - the full
     methods consolidate in the appendix. -->
<!-- No "Baselines and change control" section: the identity stamp and the ledger
     carry the specifics; the prose is maintainer guidance - a guides-table row
     (guide-baselines-and-change-control), never a reader subchapter. -->
