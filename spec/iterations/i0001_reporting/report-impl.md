---
id: report-impl
statement: quack report is implemented to internal quality. It is a determinizer command, with no judgment. It computes the ReportModel and emits report.html into .quack/out/. It computes the ledger-derivable metrics: trace-coverage, suspect-frontier, killer coverage, executed coverage. It surfaces the history metrics (reversal, rework, self-cert) as pending an attest event log. It reuses the existing engine load/hash/attest functions rather than duplicating them.
depends_on: [report-design]
class: review
killer: false
---

## Rationale (not load-bearing)
L4/Build (internal quality). Forward work — walked by /engage next, not blessed at plan time.
Metrics are atom 0051 ported: each a ratio over the append-only attest log + DAG.
