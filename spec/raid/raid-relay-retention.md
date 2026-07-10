---
id: raid-relay-retention
type: raid
kind: risk
probability: 0.5
impact: 0.5
mitigation: TODO
owner: TODO
status: open
statement: Third-party relays retain ask content (ntfy.sh caches about 12 hours; Slack stores messages indefinitely).
class: review
killer: false
---
## Rationale (not load-bearing)
Risk (owner-ruled acceptable): the pairing flow prints a transit disclaimer; self-hosting removes retention; asks carry check ids and statements, never secrets.
