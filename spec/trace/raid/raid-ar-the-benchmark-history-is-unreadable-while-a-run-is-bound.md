---
id: raid-ar-the-benchmark-history-is-unreadable-while-a-run-is-bound
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-the-benchmark-history-is-unreadable-while-a-run-is-bound at risk — the response hinges on el-benchmark-guard.
owner: the adjudicator
trigger: any change to el-benchmark-guard, or to the scenario on req-the-benchmark-history-is-unreadable-while-a-run-is-bound
status: open
impact: three exclusion lists decide what a lane verb may see, they disagree, and se_file_read consults none of them; one rule has to bind four verbs before this concealment can be trusted
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-the-benchmark-history-is-unreadable-while-a-run-is-bound
  - el-benchmark-guard
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-benchmark-guard; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.