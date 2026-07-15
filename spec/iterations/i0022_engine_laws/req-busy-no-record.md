---
id: req-busy-no-record
type: requirement
statement: While a consulted resource guard reports busy, the engine shall discard that run's verdict rather than record it.
class: review
killer: false
---
## Rationale (not load-bearing)
A busy render guard once recorded a vacuous false verdict that self-perpetuated
in the cache (NOTE-20260714-164933, raid-busy-record). Guard the class.
