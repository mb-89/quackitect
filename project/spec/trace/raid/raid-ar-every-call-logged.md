---
id: raid-ar-every-call-logged
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-every-call-logged at risk — the response hinges on el-satellite-supervisor.
owner: the adjudicator
trigger: any change to el-satellite-supervisor, or to the scenario on req-every-call-logged
status: open
impact: the call log is core-owned so a satellite's line crosses a channel, and what happens to a dying satellite's in-flight call is the element's own open question.
breaks_how_badly: fatal
how_likely: plausible
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-every-call-logged
  - el-satellite-supervisor
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-satellite-supervisor; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.