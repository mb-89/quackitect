---
id: req-attest-grant
type: requirement
statement: When an attestation is requested without a prior valid key, the engine shall require a one-time grant minted on the interactive console channel.
depends_on: []
class: review
killer: true
phase: [engineering]
discipline: [process]
quality: [security]
---
## Rationale (not load-bearing)
First-of-session = no prior key to present. Recitation is a speech act aimed at the adjudicator; only a person can verify it, so the session's root grant comes from their channel (i8 channel detection). Exactly one adjudicator interaction per session, by the owner's directive 2026-07-04.
