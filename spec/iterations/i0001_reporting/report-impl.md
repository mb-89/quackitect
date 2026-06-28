---
id: report-impl
statement: `quack report` is implemented to internal quality — a determinizer command (no judgment) that computes the ReportModel and emits report.html into .quack/out/, computing the ledger-derivable metrics (trace-coverage, suspect-frontier, killer & executed coverage) and surfacing the history/actor metrics (reversal, rework, self-cert) as pending an attest event log, reusing the existing engine load/hash/attest functions rather than duplicating them.
depends_on: [report-design]
class: review
killer: false
---

## Rationale (not load-bearing)
L4/Build (internal quality). Forward work — walked by /engage next, not blessed at plan time.
Metrics are atom 0051 ported: each a ratio over the append-only attest log + DAG.
