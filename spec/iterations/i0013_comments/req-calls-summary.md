---
id: req-calls-summary
type: requirement
depends_on: []
statement: When quack calls --summary runs, the engine shall print the call-log aggregate and delete the log.
class: review
killer: false
phase: [maintenance]
discipline: [software]
quality: [maintainability]
---
## Rationale (not load-bearing)
The retro method requires this aggregation every time; today it is a hand-written one-liner. Retention stays retro-bound (adr-call-log).
