---
id: req-battery-parallel
type: requirement
statement: Where the host offers spare cores, the battery shall run independent selftests concurrently.
class: review
killer: false
---
## Rationale (not load-bearing)
The i13 battery-cost lead chose Go concurrency (NOTE-20260707-172736).
Optional feature; M4 sizes it or vetoes it.
