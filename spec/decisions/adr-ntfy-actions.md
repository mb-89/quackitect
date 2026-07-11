---
id: adr-ntfy-actions
decided_in: i0016_structural_models
type: adr
adjudicated_by: user
statement: The ntfy ask renders X-Actions buttons publishing to the answer topic.
class: review
killer: false
---
## Rationale (not load-bearing)
Pugh: actions dominates plain-reply on every criterion except a trivial effort delta; one tap answers (probed live 2026-07-09: PUT with X-Actions accepted, since-poll returns verbatim). Plain-reply remains the documented degraded path when a client lacks action support.
