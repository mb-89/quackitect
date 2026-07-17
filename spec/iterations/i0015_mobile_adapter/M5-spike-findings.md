# M5 — Prove the riskiest unknowns (i0015_mobile_adapter, systematic)

## The spike (timeboxed, real wire, 2026-07-09)

Machine side of the ntfy loop, run live from this NAT'd desk against ntfy.sh:

1. Minted a high-entropy topic pair (`quack-ask-…`, `quack-answer-…`).
2. Published a gate-shaped ask: title `quackitect GATE ask`, high priority. The `bangbang` tag marks the gate-distinct rendering. It carried TWO `X-Actions` http buttons whose taps PUT `y <cid>` / `n <cid>` to the answer topic. Accepted: 200.
3. Simulated the tap with the exact PUT the button fires. The answer landed.
4. `GET /json?poll=1&since=all` on the answer topic returned the answers ORDERED with the correlation id verbatim — `y i15-spike-001` first, the late `n i15-spike-001` second: exactly the duplicate the engine ignores first-wins (req-answer-idempotent).

Validated by this evidence:

- dispatch
- the wire format (options as buttons, correlation id in the body)
- answer transport
- ordered pollability
- the duplicate case

Zero code beyond HTTP calls — the ~100-line adapter estimate stands.

## The phone leg — VALIDATED (owner, 2026-07-09)

The owner subscribed to the ask topic in the ntfy app. The owner saw the gate ask WITH its buttons (fetched from the backlog) and tapped **bless (y)**. The answer topic shows the third event (`id DTuIChC0HBwR`, ~83 minutes after the simulated pair) carrying `y i15-spike-001` — published BY THE PHONE's button. Desk → relay → phone → tap → relay → desk: closed end-to-end on real wire. The killer's referent ("from this desk to the owner phone") is demonstrated.

Also proven by the backlog fetch: an ask published while the phone is offline still arrives actionable — the loop tolerates a sleeping device within the relay's retention window.

## Deferred leg (owner sequencing: "ntfy first")

- **Slack text-poll on a real workspace** — moves to the M6 build's pairing step with a setup guide (a Slack app with a bot token, `chat:write` + `channels:history`, one channel). The M4 kill-criterion (polling misses messages: pagination or rate limits) is CHECKED THERE, before the Slack adapter's tests turn green.

## Design is buildable  → i15-m5-buildable

The spike walked the exact seam the build uses: send(ask) = one HTTP PUT with headers. poll() = one HTTP GET with `since=`. Both are plain net/http. The exec lane mirrors the proven role-seam file contract. No protocol invention anywhere in the chosen shape.

## Milestone review

**Verify.** Every claim above has wire evidence: the event ids and timestamps are on the topics; the phone tap's event is distinguishable from the simulations by its timing and origin.
**Validate.** The riskiest assumption — the whole loop over a third-party relay to a real phone behind nothing but topic secrecy — held. The design needs no correction; the requirements stand as stated.
**Red-team.** Opposing case: "one tap proves nothing about reliability." Held: reliability laws (timeout, idempotency and multi-ask) are requirement-tested at M6. The spike's job was the EXISTENCE of the lane, and the backlog-fetch behavior exceeded expectation. Kill-criterion carried forward: the Slack polling check gates the Slack adapter at M6.
**Verdict: PASS** — proceed to the gate bless.
