---
id: req-ask-timeout
type: requirement
depends_on: []
statement: When an ask reaches its timeout unanswered, the engine shall expire the ask and clear or supersede its device notification.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
Home Assistant failure mode: dangling notifications; dismissal events are unreliable, so expiry is engine-driven (raid-dangling-notifications).
