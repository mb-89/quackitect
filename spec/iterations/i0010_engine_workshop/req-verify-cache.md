---
id: req-verify-cache
type: requirement
depends_on: []
statement: When coverage evaluation reaches an executed test, the engine shall reuse a verdict recorded for that test at its full input hash and the current engine build identity, re-running the test only on a cache miss.
class: review
killer: false
phase: [maintenance]
discipline: [software]
quality: [efficiency]
---
## Rationale (not load-bearing)
TODO
