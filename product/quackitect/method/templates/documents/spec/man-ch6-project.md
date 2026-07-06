---
id: man-ch6-project
type: manifest
mode: chapter
statement: Project - the approach, the record, and the risks, mostly derived.
---
## How this project runs
<!-- fill [mandatory]
Contents: the chapter in one breath - approach and decisions, the derived
  timeline, the risk register, the baseline.
Form: two to four sentences.
-->
<!-- ai:3 -->
{{lede}}
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
{{approach}}

![[decisions-project.base]]
---
## Milestones and timeline
<!-- fill [mandatory]
Contents: one line introducing the derived timeline - iteration history, gate
  states, planned versions. The walk is the truth; nothing authored.
Form: one prose line, then the figure.
-->
<!-- ai:3 -->
{{timeline-lede}}

fig: timeline
---
## Risks, assumptions, issues, dependencies
<!-- fill [mandatory]
Contents: one line introducing the register. Items carry probability and impact
  (0..1), mitigation in avoid-then-detect-then-limit order, an owning role, a
  status. The context unit of design input renders the assumption rows - one
  source, two views.
Motivation: an unrecorded assumption is how orbits get lost.
Form: one prose line; the register renders derived. Deeper scoring is a method
  note for projects that need it.
Sources: reduction order, triple scoring @[[ref-methodische-entwicklung]].
-->
<!-- ai:3 -->
{{raid-lede}}

![[raid.base]]
---
## Baselines and change control
<!-- fill [mandatory]
Contents: one short prose unit - which baseline this rendering represents (the
  identity stamp carries it: source state, iteration, engine version) and where
  the change history lives (the ledger renders it, this section never restates it).
Motivation: strike-through-never-delete is a PROPERTY the ledger enforces, not a
  discipline the reader must trust - stated once, here.
Sources: baselines @[[ref-modellbasierte-pe]]; change discipline @[[ref-pahl-beitz]].
-->
<!-- ai:3 -->
{{baselines}}
