---
id: raid-ar-call-answers-in-one-second
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-call-answers-in-one-second at risk — the response hinges on el-walk-engine.
owner: the adjudicator
trigger: any change to el-walk-engine, or to the scenario on req-call-answers-in-one-second
status: open
impact: the serving loop shares its process with heavy walks; a 274-second entry stands recorded
breaks_how_badly: corrosive
how_likely: <!-- the likelihood grade — the words live in meth-likelihood-scale, graded at the register review -->
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-call-answers-in-one-second
  - el-walk-engine
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-walk-engine; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.