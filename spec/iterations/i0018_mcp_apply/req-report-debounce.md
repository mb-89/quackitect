---
id: req-report-debounce
type: requirement
depends_on: []
statement: If a bless triggers a report refresh within the debounce interval of the last render, then the engine shall skip that render.
class: review
killer: false
---
## Rationale (not load-bearing)
The retro lead NOTE-20260711-180535 (renders): 143 report renders in one iteration, mostly the detached refresh fired by every bless. A bless wave then spawns dozens of identical renders; the interval collapses them to one.
