# M3 — Candidate architectures (i0015_mobile_adapter, systematic)

## Alternatives elaborated  → i15-m3-alternatives  (killer)

Three axes, two viable candidates each (the project chapter renders the per-axis tables):

- **slack-transport** — how Slack answers come back without an inbound endpoint:
  - [cand-slack-socket](cand-slack-socket.md): Socket Mode over a hand-rolled RFC6455 client. One-tap buttons, strong auth; ~400 lines of protocol code, connection lifecycle to own.
  - [cand-slack-text-poll](cand-slack-text-poll.md): `chat.postMessage` + `conversations.history` polling; the adjudicator types the option id. Plain HTTP, ~150 lines; two-to-four taps per answer.
  - Eliminated, not minted: Slack interactivity webhooks — they REQUIRE a reachable endpoint; NAT-hostile by construction, non-viable here.
- **ntfy-shape** — how the ntfy ask renders:
  - [cand-ntfy-actions](cand-ntfy-actions.md): X-Actions http buttons publish the option to the answer topic; one tap.
  - [cand-ntfy-reply](cand-ntfy-reply.md): plain notification, manual reply publish; the degraded-but-viable floor.
- **seam-shape** — what a channel adapter IS:
  - [cand-seam-internal](cand-seam-internal.md): Go interface, adapters compiled in.
  - [cand-seam-exec-lane](cand-seam-exec-lane.md): the same interface plus ONE exec adapter kind (external process, file contract) — the corporate PowerShell adapter drops in without engine changes.

## Criteria weighted  → i15-m3-criteria

Derived from the requirement set. Weights fixed BEFORE scoring (anti-bias law). Scale anchors in each criterion's body:

- [crit-zero-dep](crit-zero-dep.md) — 0.9 (req-adapter-zero-dep)
- [crit-nat-friendly](crit-nat-friendly.md) — 0.9 (req-slack-channel, the NAT law)
- [crit-answer-auth](crit-answer-auth.md) — 0.6 (raid-answer-forgery bounds it)
- [crit-corporate-seam](crit-corporate-seam.md) — 0.6 (owner: wanted soon)
- [crit-one-tap](crit-one-tap.md) — 0.5
- [crit-build-effort](crit-build-effort.md) — 0.5

## Feasibility rough-checked  → i15-m3-feasibility

- **ntfy: PROBED LIVE from this NAT'd machine (2026-07-09)** — HTTP PUT to a fresh high-entropy topic returned 200 with an `X-Actions` header accepted; `GET /json?poll=1&since=all` returned the published message verbatim. One probe settles the datasheet: send+poll works with zero code beyond net/http. (Synthetic payload, throwaway topic.)
- **Slack text-poll**: `chat.postMessage` and `conversations.history` are Tier-3 Web API methods over plain HTTPS with a bot token — no endpoint, no websocket; feasibility is documentary plus the M5 spike on a real workspace (needs the owner's token; recorded as the spike's first step).
- **Slack socket-mode**: `apps.connections.open` returns a wss URL; the client must speak RFC6455 (masking, ping/pong, envelope acks). Feasible zero-dep but the ~400-line estimate and the reconnect lifecycle are the cost; no live probe without a workspace app.
- **Seam shapes**: both are plain Go; the exec lane reuses the roles pattern (file-based contract, already proven by the method's role seam).

## Milestone review

**Verify.** Every candidate carries its axis and per-axis ratings. The criteria carry metric, weight and anchors. The live probe is reproducible from the steps above.
**Validate.** The axes cover exactly the open decisions the rulings left (Slack shape, seam shape and ask rendering). Nothing re-opens ruled matters (channel set, full loop and pairing shape).
**Red-team.** Opposing case: "the ratings pre-bake the winner." Held: the anchors are stated per criterion and the M4 Pugh run uses the STRONGEST rival as datum with a reversed sensitivity check — a flipped winner becomes a tripwire, not a silent dismissal. Kill-criterion: if the M5 spike shows Slack text-poll latency or the typed-answer UX is unacceptable to the adjudicator, socket-mode re-enters at M4 as the datum.
**Verdict: PASS** — proceed to the gate bless.
