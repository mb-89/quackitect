---
minted_in: i1
id: opt-decision-trace-schema
type: "[[option]]"
statement: fix one minimum evidence record per decision event, so every decision can be reconstructed from the record alone
cluster: cluster-the-account
found_by: prior-art
source: "Decision Trace Schema for Governance Evidence in Real-Time Risk Systems, https://arxiv.org/pdf/2604.09296"
---

## Mechanism

A schema names what must be preserved for each decision: the inputs that
were available, the version of whatever processed them, the values computed,
the thresholds applied and the outcome. The claim is that post-hoc audit
becomes possible because the record is complete by construction rather than
by whoever was writing it that day.

WHAT IT WOULD COST HERE. This project logs every call and derives a trace
graph, but the two are different shapes and neither is a fixed per-decision
record. A schema would say what a decision event owes, and the gap between
the log and the trace is exactly where it would sit.

The cost is rigidity. A fixed record is complete or it is refused, and this
system currently lets a decision be recorded in whatever shape the state
happened to ask for.
