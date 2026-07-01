---
id: test-report-live
type: test
verifies: [req-report-live-reload]
statement: Selftest renders the report and asserts it carries the live-reload hook (an EventSource on /__reload). Recompute-live is structural — StatusMap is called on every render, the snapshot machinery is removed.
class: review
verify: selftest:report-live
killer: false
---
## Rationale (not load-bearing)
i0006 test for the live report.
