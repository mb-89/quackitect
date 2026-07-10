---
id: req-answer-idempotent
type: requirement
depends_on: []
statement: If an answer arrives for a resolved or expired ask, then the engine shall ignore it and keep the first resolution.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
Home Assistant failure mode: duplicate and late answers are normal; correlation-bound idempotency is the guard (raid-dangling-notifications).
