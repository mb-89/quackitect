---
id: adr-kofmqtq
type: adr
decided_in: i0025_clean_state
adjudicated_by: user
statement: Retired by the owner's ruling 2026-07-16: ntfy suffices as the phone lane. The Slack text-poll lane is not built and will not be. The paired ntfy channel carries asks, answers, and blesses end-to-end.
class: review
killer: false
kind: architecture
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: agent-proposal: first of architecture|project|waiver|quality|risk - veto or confirm
---
## Rationale (not load-bearing)
The Slack text-poll lane was adopted in i15 as a fallback channel but never built. The ntfy lane shipped instead and proved itself end-to-end: pairing, asks, one-tap answers, and blesses. A second adapter would duplicate a working lane for no recorded need. The owner ruled it retired on 2026-07-16.
