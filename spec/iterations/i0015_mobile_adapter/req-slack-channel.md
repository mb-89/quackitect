---
id: req-slack-channel
type: requirement
depends_on: []
statement: Where the Slack channel is paired, the engine shall send asks and receive answers without an inbound network endpoint.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [portability]
---
## Rationale (not load-bearing)
Owner ruling 2026-07-09: Slack in the first wave. Interactivity webhooks are NAT-hostile - the M3 candidates decide socket-mode vs text-reply polling.
