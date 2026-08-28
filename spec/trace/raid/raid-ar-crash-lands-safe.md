---
unreachable_refs:
  - el-satellite-supervisor
id: raid-ar-crash-lands-safe
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-crash-lands-safe at risk — the response hinges on el-satellite-supervisor.
owner: the adjudicator
trigger: any change to el-satellite-supervisor, or to the scenario on req-crash-lands-safe
status: open
impact: N satellites add failure states one process does not have, and the element records the in-flight call of a dying satellite as its own open question.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-crash-lands-safe
  - el-satellite-supervisor
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-satellite-supervisor; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.