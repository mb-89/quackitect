---
id: se.guidance-phone-setup
kind: guidance
statement: "How to enable the phone lane: click the board's phone-connect tool and scan the QR (or hand-write ~/.se/<project>/phone.json); the lane is off until paired, and the config is never committed."
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
applies_to:
  - process
guidance: []
---

## Enabling the phone lane (owner step)

The phone lane ships built but OFF. Pairing turns it on and is always the owner's act.

### The one-gesture way (the board)

1. On the board's header, click the phone-connect tool (the 📲 icon) - the first tool in the middle strip.
2. A QR code renders in the details pane, under the caption "Scan this QR code to link via ntfy."
3. Scan it with your phone's ntfy app. The QR encodes an `ntfy://<host>/<topic>` DEEP LINK, so scanning opens the app (not the browser) and subscribes it to the topic.
4. Done: a fresh high-entropy topic pair is minted for you and written to `~/.se/<project>/phone.json` with `enabled: true`. You never type a topic.

Clicking again re-renders the SAME pairing - it will not silently re-pair a phone already linked. Machine-specific by design: each machine writes its own phone.json and pushes to its own topic, so on two machines you pair twice.

### The manual way (self-hosted or advanced)

You can hand-write the machine-local config instead (never committed, holds the secret) - `~/.se/<project>/phone.json`:

```json
{
  "enabled": true,
  "base": "https://ntfy.sh",
  "topic": "<a high-entropy topic you pick>",
  "answer_topic": "<a second high-entropy topic>",
  "token": "<optional ntfy access token>"
}
```

- The phone subscribes to `topic` - offers publish there. Your one-tap bless/dismiss rides each offer notification's action buttons, which publish to `answer_topic`; you do not subscribe to it by hand.
- Authenticity = possession of the topics (adr-answer-authenticity, accepted risk): the minted names are unguessable; self-host ntfy with a token for the upgrade path.
- The board process runs the lane when the file is present; absent or `enabled: false`, nothing publishes and every other channel works.
- The config is written only on YOUR board click (or your hand). The agent never pairs unprompted, and never logs the token.

## Verifying (owner-physical, the parked RAID demo)

Reach a gate offer, confirm the phone buzzes, tap bless, confirm a grant `channel=phone` lands in the grants ledger within the 6h window.
