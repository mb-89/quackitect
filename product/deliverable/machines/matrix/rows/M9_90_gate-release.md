---
kind: matrix-row
name: gate-release
statement: "GATE release: docs match the surface, the handover is accepted - the bless ships it."
state_kind: gate
filled_by: agent
depends_on:
  - ship-review
floor: true
---

## Guidance

Review per [[meth-gate-review]]. The retro waits beyond the terminal - its field-feedback question opens the next start. Market iterations: no ship without the real-world checks green.

## Evidence form

- docs_match | (killer) docs complete and matching the actual surface | required
- packaged | versioned, configuration baselined, entry script in place | required
- dependencies_ruled | the ship review done, sticky rulings honored | required
- handover_accepted | (killer) the bless is the acceptance | required
- market_block | (market) real-world validation green - blocks the ship only for to-market iterations | optional
