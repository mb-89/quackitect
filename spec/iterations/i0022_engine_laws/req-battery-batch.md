---
id: req-battery-batch
type: requirement
statement: When selftest runs with no content change since the last full run, the engine shall answer from the verdict cache.
class: review
killer: false
---
## Rationale (not load-bearing)
Full re-runs belong after a recompile or a content move, once per batch
(NOTE-20260714-171206). quack verify stays the eager lane.
