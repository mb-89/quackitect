---
id: raid-ar-acts-carry-role-and-channel
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-acts-carry-role-and-channel at risk — the response hinges on el-walk-engine.
owner: the adjudicator
trigger: any change to el-walk-engine, or to the scenario on req-acts-carry-role-and-channel
status: open
impact: every channel must pass the one dispatch seam, or the stamp lies
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-acts-carry-role-and-channel
  - el-walk-engine
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-walk-engine; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.