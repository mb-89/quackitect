---
id: se.guidance-phone-setup
kind: guidance
statement: "How to enable the phone lane: populate ~/.se/<project>/phone.json with an ntfy topic pair; the lane is off until you do, and the file is never committed."
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
applies_to:
  - process
guidance: []
---

## Enabling the phone lane (owner step)

The phone lane ships built but OFF. To turn it on, create the machine-local config (never committed, holds the secret):

`~/.se/<project>/phone.json`:

```json
{
  "enabled": true,
  "base": "https://ntfy.sh",
  "topic": "<a high-entropy topic you pick>",
  "answer_topic": "<a second high-entropy topic>",
  "token": "<optional ntfy access token>"
}
```

- Subscribe your phone's ntfy app to BOTH topics; offers publish to `topic`, your one-tap bless/dismiss publishes to `answer_topic`.
- Authenticity = possession of these topics (adr-answer-authenticity, accepted risk): pick unguessable names, or use a self-hosted ntfy with an access token for the upgrade path.
- The board process runs the lane when the file is present; absent or `enabled:false`, nothing publishes and every other channel works.
- The agent NEVER writes this file, mints the topics, or logs the token - pairing is the owner's act.

## Verifying (owner-physical, the parked RAID demo)

Reach a gate offer, confirm the phone buzzes, tap bless, confirm a grant `channel=phone` lands in the grants ledger within the 6h window.
