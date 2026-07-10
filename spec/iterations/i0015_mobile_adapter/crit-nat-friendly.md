---
id: crit-nat-friendly
type: criterion
metric: inbound endpoints required
statement: The axis weighs whether the candidate works with outbound HTTPS only, no inbound endpoint.
class: review
killer: false
---
## Rationale (not load-bearing)
Weight 0.9 (M3, derived from req-slack-channel and the NAT law). Scale anchors - 1.0: outbound polling or outbound socket only; 0.0: needs a reachable webhook.
