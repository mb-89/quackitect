---
id: req-log-retention
type: requirement
depends_on: []
statement: If the call log exceeds its size cap, then the engine shall drop the oldest lines.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [reliability, efficiency]
---
## Rationale (not load-bearing)
The real project's logs dir held 122 MB of call logs before the i13 retro deletion.
