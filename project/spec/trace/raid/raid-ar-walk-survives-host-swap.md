---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: raid-ar-walk-survives-host-swap
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-walk-survives-host-swap at risk — the response hinges on el-record-store.
owner: the adjudicator
trigger: any change to el-record-store, or to the scenario on req-walk-survives-host-swap
status: open
impact: a swap keeps only what the tree holds; anything host-held dies with the host
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-walk-survives-host-swap
  - el-record-store
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-record-store; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.