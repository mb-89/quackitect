---
id: raid-ar-overlay-survives-update
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-overlay-survives-update at risk — the response hinges on el-engine-delta.
owner: the adjudicator
trigger: any change to el-engine-delta, or to the scenario on req-overlay-survives-update
status: open
impact: the rebase at entry catches a stale record override loudly, and the same catch is asserted for a vehicle overlay by generalisation rather than composed.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-overlay-survives-update
  - el-engine-delta
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-engine-delta; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.