# M4 — Decide the architecture (i0015_mobile_adapter, systematic)

## Chosen architecture stated  → i15-m4-chosen

The ask loop lives in the engine, behind ONE seam. The chosen shape:

- **Seam**: a Go adapter interface (`send ask`, `poll answers`) with ONE exec adapter kind driving an external process over a file contract — [adr-ask-seam-exec-lane](../../decisions/adr-ask-seam-exec-lane.md).
- **ntfy channel**: X-Actions buttons publishing the option to the answer topic; since-polling reads it back — [adr-ntfy-actions](../../decisions/adr-ntfy-actions.md).
- **Slack channel**: `chat.postMessage` sends the ask; `conversations.history` polling reads a typed option id (or `n <comment>`) — [adr-slack-text-poll](../../decisions/adr-slack-text-poll.md).
- **Trust model**: one-time pairing mints high-entropy credentials (topic trio / bot token + channel); answer authenticity = possession, accepted-risk WRITTEN — [adr-answer-authenticity](../../decisions/adr-answer-authenticity.md).

## Choice traced to the weighted criteria  → i15-m4-traced-choice

Pugh, weights fixed at M3 (0.9 zero-dep, 0.9 NAT, 0.6 auth, 0.6 corporate, 0.5 one-tap, 0.5 effort):

- **slack-transport** (datum = socket-mode, the strongest rival): text-poll **3.29** vs socket 2.58. Wins zero-dep, effort, corporate; loses one-tap and some auth. Sensitivity REVERSED: socket wins only when one-tap outweighs zero-dep roughly two-to-one — credible exactly if typed answers fail the adjudicator in practice. **Tripwire recorded** (in the ADR): a failed typed-answer UX at M5 or in the field re-enters socket-mode as datum.
- **ntfy-shape**: actions **3.24** vs plain-reply 2.94 — dominates on one-tap, ties or wins elsewhere; no credible reversal (plain-reply survives only as the documented degraded path).
- **seam-shape** (per-axis criteria): exec-lane **1.85** vs internal-only 1.53 — corporate-seam carries it. Reversal needs the corporate seam near-worthless against the standing "wanted soon" ruling: considered, judged not credible, recorded here.

## ADRs recorded and traced  → i15-m4-adr-traced

Four decisions in `spec/decisions/`, each addressing its requirement through the lanes, chosen/rejected edges wired to the candidates. `coverage:adr-traced` computes.

## Milestone review

**Verify.** Every choice ties to the M3 ratings and weights; both Pugh runs and both reversals are written; raid-answer-forgery is now WRITTEN into an ADR, closing the red-team obligation.
**Validate.** The architecture satisfies all thirteen requirements on paper; nothing contradicts a ruling; the corporate seam is designed-for without being built.
**Red-team.** Opposing case: "text-poll makes Slack a second-class channel." Held: the tripwire keeps socket-mode one credible flip away, and ntfy carries the one-tap lane meanwhile. Kill-criterion: an M5 spike showing polling misses Slack messages (pagination/rate limits) steps back here.
**Verdict: PASS** — proceed to the gate bless.
