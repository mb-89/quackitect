---
id: se.guidance-phone-setup
kind: guidance
statement: "How to enable the phone lane: click the board's phone-connect tool and scan the QR (or hand-write ~/.se/<project>/phone.json); optionally add ~/.se/<project>/brief.json for the encrypted full-text brief. The lane is off until paired, the config is never committed, and a gate reaches the phone exactly when the run would otherwise WAIT for the owner."
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
- The topics stay **bare** here. Action URLs are built absolute (`<base>/<answer_topic>`) at the moment of sending - a pre-joined or scheme-like value is what made the tap fail before (`se.adr-absolute-action-urls`).
- Authenticity = possession of the topics (adr-answer-authenticity, accepted risk): the minted names are unguessable; self-host ntfy with a token for the upgrade path.
- The **run** pushes, at the moment it starts waiting for you; the **board** reads your taps. Absent config or `enabled: false`, nothing publishes and every other channel works.
- The config is written only on YOUR board click (or your hand). The agent never pairs unprompted, and never logs the token.

## Verifying (owner-physical, the parked RAID demo)

Reach a gate offer **the run will wait on**, confirm the phone buzzes, open the brief, tap bless, and confirm a grant `channel=phone` lands in the grants ledger within the 6h window.

## When you get pushed — and when you don't

**The rule: a gate reaches your phone exactly when the agent would otherwise be WAITING for your input.** That is the whole test.

- A gate the agent will **self-bless** under a delegation grant pushes **nothing**. An unattended run is silent, however many gates it walks.
- A gate the run is about to **park** on **always** pushes — it does not matter whether you are at the desk, because the run cannot know that.

Mechanically this is not a heuristic: `se_wait { condition: { kind: "offer" } }` **is** the act of waiting, so the wait itself sends the card. i8's board timer, which pushed whenever it noticed an offer, is gone — a poller cannot know the run's intent. See `se.adr-announce-by-adjudicator`. The board still **reads taps**, because a tap arrives long after the agent's turn has ended.

## The rich brief (optional second step)

Paired alone, a card carries the gate's first 400 characters plus **bless** and **dismiss**. That is a complete, legal rung — you can stop here.

To read the **whole** gate on the phone, add a brief store at `~/.se/<project>/brief.json`:

```json
{
  "enabled": true,
  "account": "<cloudflare account id>",
  "namespace": "<workers kv namespace id>",
  "serve": "https://<your-worker>.workers.dev",
  "token": "<cloudflare api token with KV write>"
}
```

With it the card gains a third action — **read the brief** — opening a page carrying the gate's full text.

- The page is **encrypted** (AES-256-GCM); the key rides the **URL fragment**, which browsers never send to a server. The host stores ciphertext only.
- The link is **confirmed servable before it is announced**: you never tap into a 404.
- A brief **expires with its offer** (capped at 6h), so no readable archive accumulates at the host.
- All four fields must be present and well-formed, or the store is simply not used and the lane drops to the actions-only rung.
- **Honest limit:** this protects against the *host*, not against whoever holds the link — link and key travel through the notification relay.

If publishing or confirming fails, the card is still sent with bless and dismiss, and the degradation is **recorded** — a broken lane is never mistaken for a quiet one.
