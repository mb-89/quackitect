---
id: need-engage
type: need
source: stk-project-owner
statement: As a builder I need to advance an iteration from plan through build to delivery, with the work and its checks visible.
class: review
killer: false
functions: [pick the next check, record an adjudication, reopen a changed check]
---

## note (not load-bearing)
Dogfood: quackitect's own spec, typed.

## Success criteria
- Every killer gate of a shipped iteration carries a user adjudication. Metric: the share of killer gates blessed by the agent rather than the user. Target: zero.
- A stalled gate is answerable away from the desk. Metric: a gate ask reaches the paired phone and the answer records as the adjudication, end-to-end on a real gate. Target: demonstrated on ntfy (further channels demonstrate when their wave ships).
