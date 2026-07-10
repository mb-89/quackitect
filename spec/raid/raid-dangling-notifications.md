---
id: raid-dangling-notifications
type: raid
kind: risk
probability: 0.5
impact: 0.5
mitigation: TODO
owner: TODO
status: open
statement: A timed-out or superseded ask leaves a stale actionable notification on the phone.
class: review
killer: false
---
## Rationale (not load-bearing)
Risk (Home Assistant prior art): every pending ask carries a timeout, answers are idempotent and correlation-bound (late or duplicate answers safely ignored), expiry clears or supersedes the notification.
