---
id: crit-build-cost
type: criterion
weight: 0.20
metric: estimated build steps and battery re-runs a candidate costs
target: the build plan fits the iteration without tripping the requirement cap or drowning the walk
statement: The axis weighs the engine implementation cost against this iteration's forty-test budget.
class: review
killer: false
provenance:
  class: schema-default (review)
  killer: schema-default (false)
---
## Rationale (not load-bearing)
Weight 0.20 - the M2 red-team named the forty-test weight, the cap headroom of nine, and the parser-change cache invalidation; cost discipline is a first-class axis on this machine.
