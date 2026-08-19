---
id: raid-ar-surface-answers-in-one-second
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-surface-answers-in-one-second at risk — the response hinges on el-benchmark-guard.
owner: the adjudicator
trigger: any change to el-benchmark-guard, or to the scenario on req-surface-answers-in-one-second
status: open
impact: the same guard reaches the mirror's own reads while a run is bound, and the cost is paid on a surface a person is watching
breaks_how_badly: corrosive
how_likely: <!-- the likelihood grade — the words live in meth-likelihood-scale, graded at the register review -->
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-surface-answers-in-one-second
  - el-benchmark-guard
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-benchmark-guard; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.