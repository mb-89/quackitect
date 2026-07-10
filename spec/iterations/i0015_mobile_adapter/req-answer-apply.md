---
id: req-answer-apply
type: requirement
depends_on: []
statement: When a well-formed answer carrying a pending correlation id arrives on a paired channel, the engine shall record the answer as the adjudication and mark the ask resolved.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
The apply half of the loop; a reject-with-comment flows back as the answer (HumanLayer mechanism).
