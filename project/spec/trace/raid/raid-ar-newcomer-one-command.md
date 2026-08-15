---
id: raid-ar-newcomer-one-command
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-newcomer-one-command at risk — the response hinges on el-bootstrap.
owner: the adjudicator
trigger: any change to el-bootstrap, or to the scenario on req-newcomer-one-command
status: open
impact: the measure is exactly one command to a greeting, and the greeting now needs a core up and a satellite per open record that the chart's bootstrap does not start.
breaks_how_badly: abrasive
how_likely: expected
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-newcomer-one-command
  - el-bootstrap
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-bootstrap; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.