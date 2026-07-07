---
id: raid-vale-dependency
type: raid
kind: dependency
probability: 0.3
impact: 0.4
mitigation: never linked; pulled once; loud graceful absence
owner: project-owner
status: accepted
statement: Vale is the first soft runtime dependency.
class: review
killer: false
---
Vale is the first soft runtime dependency. Accepted trade, recorded in its decision: absence yields one loud warning and an empty advisory lane, never a broken build.
(Backfilled at the i12 pilot migration from M1-frame.md and M6-evidence.md.)
