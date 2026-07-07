---
id: req-verdict-surgical
type: requirement
depends_on: []
statement: When quack build re-baselines, the engine shall keep every verdict whose inputs did not change.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [efficiency]
---
## Rationale (not load-bearing)
The full cache wipe forces whole-suite re-runs after every content edit. Guard: the i11 stale-FAIL wedge must stay dead - a verdict whose inputs DID change always dies.
