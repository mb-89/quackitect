---
id: crit-responsiveness-law
type: criterion
weight: 0.15
metric: worst interaction latency on the reference machine (seconds)
target: under one second per the responsiveness guide, measured at the timing selftests
statement: The axis weighs whether interaction stays inside the one-second law on the reference machine.
class: review
killer: false
provenance:
  class: schema-default (review)
  killer: schema-default (false)
---
## Rationale (not load-bearing)
Weight 0.15 - the one-second law binds every interactive render this iteration adds.
