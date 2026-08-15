---
id: raid-ar-fresh-machine-runs
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-fresh-machine-runs at risk — the response hinges on el-bootstrap.
owner: the adjudicator
trigger: any change to el-bootstrap, or to the scenario on req-fresh-machine-runs
status: open
impact: a fresh machine now has a core and a satellite per record to bring up, and the bootstrap on the chart converges files and reports drift.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-fresh-machine-runs
  - el-bootstrap
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-bootstrap; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.