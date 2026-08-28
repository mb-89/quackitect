---
unreachable_refs:
  - el-core
id: raid-ar-mirror-stays-on-the-machine
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-mirror-stays-on-the-machine at risk — the response hinges on el-core.
owner: the adjudicator
trigger: any change to el-core, or to the scenario on req-mirror-stays-on-the-machine
status: open
impact: the core is the mirror grown, so a satellite-facing channel joins a server whose whole security property is loopback-only listening, and nothing on the chart binds that channel.
breaks_how_badly: fatal
how_likely: conceivable
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-mirror-stays-on-the-machine
  - el-core
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-core; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.