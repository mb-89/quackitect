---
id: req-monotonic-lint
type: requirement
statement: When quack lint evaluates an iteration's tasks, it shall flag any milestone subtask whose dependency chain does not pass through the prior milestone's gate, so that a mis-wired checklist cannot let next schedule a later milestone early.
depends_on: []
class: review
killer: false
phase: [maintenance]
discipline: [software]
quality: [maintainability, reliability]
---
