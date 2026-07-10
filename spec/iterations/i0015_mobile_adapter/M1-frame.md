# M1 — Frame the problem & vision (i0015_mobile_adapter, systematic)

## Vision & scope stated  → i15-m1-vision

Goal: a stalled gate is answerable from anywhere. Actual: an OPEN gate waits until the adjudicator sits at the desk. Delta: remote answerability of exactly the asks the loop already produces.

The Moore pitch: **For** the adjudicator away from the desk, **who** must answer a gate or decision ask before the walk can continue, **the** quackitect ask loop **is an** engine feature **that** sends the pager's question to a paired phone and records the answer as the adjudication. **Unlike** approval-as-a-service products and harness-bound remotes, **it** lives in the ledger, works over NAT with zero dependencies, and speaks through swappable channels (ntfy and Slack now, corporate later).

Scope (owner rulings 2026-07-04..09): the FULL send+poll+apply loop — notify-only is overruled. ntfy and Slack channels. Corporate (Teams wait-for-response, Outlook-COM) deferred but the seam is designed for it. `quack listen` (phone-initiated queries) stays sliced last or out.

PR-FAQ pressure test (working backwards): *"quackitect 0.2 lets the adjudicator bless a killer gate from the phone. Q: does this weaken adjudication? A: no — the same pager, the same explicit y, recorded actor=user with the channel noted; forgery risk is a written, accepted ADR. Q: does the walk block on the phone? A: no — the OPEN gate was always the durable stall; the agent keeps walking other ready checks."* The pitch survives the FAQ.

## Problem agreed  → i15-m1-problem  (killer)

The stall is real and recurring: every killer/milestone gate in i9–i14 waited for the desk. The mobile channel converts idle waiting into answered asks without changing the adjudication contract. Worth solving: the loop's throughput is bounded by adjudication latency, not build speed — this session's i14 walk stalled at five gates.

## State of the art checked  → i15-m1-prior-art

Positioned against the verified landscape (prior-art notes, 3-0 adversarial votes, primary sources; see the pulled note family):

- **HumanLayer** proved suspend-at-the-tool-boundary and reject-with-comment-as-answer — and its pivot proves the approval primitive is an ENGINE FEATURE, not a product. We copy the mechanism, not the business.
- **Home Assistant** actionable notifications = the battle-tested two-way loop; its failure modes (dangling notifications, unreliable dismissal, duplicate answers) enter our RAID as design law.
- **Wire format** converged industry-wide: `{id,label}` options, approve/edit/reject/respond verbs, 1–3 alternatives as the hard cross-platform ceiling — our pager format is validated law.
- **ntfy** = the NAT-friendly gap-filler no prior art covers (HTTP PUT + `since=` polling, 3 action buttons, symmetric pub-sub); **Slack** enters by owner ruling 2026-07-09 — its interactivity endpoints are NAT-hostile, so socket-mode vs text-reply-polling is a genuine M3 candidate axis.
- **Claude Code Remote Control** covers the personal lane for Claude-Code-only; the i6 lesson (harness independence) and the owner's ntfy+Slack ruling keep the engine seam harness-agnostic.

## Success is measurable  → i15-m1-success

[need-engage](../../trace/need-engage.md) carries the new pass line: a gate ask reaches the paired phone and the answer records as the adjudication, end-to-end on a real gate — demonstrated once per channel.

## Top risks logged  → i15-m1-risks

Four RAID risks minted, each with its mitigation recorded: [raid-lockscreen-actions](../../raid/raid-lockscreen-actions.md), [raid-answer-forgery](../../raid/raid-answer-forgery.md) (accepted-risk, MUST be written into the M4 channel ADR), [raid-dangling-notifications](../../raid/raid-dangling-notifications.md), [raid-relay-retention](../../raid/raid-relay-retention.md).

## Milestone review

**Verify.** Every subtask has its referent above; the risks live as raid- items, the criterion on the need, the scope in the iteration motivation.
**Validate.** The frame matches the owner's rulings verbatim (full loop, ntfy+Slack, corporate deferred, forgery written).
**Red-team.** Opposing case: "Remote Control makes this redundant." Held: it binds adjudication to one harness and cannot serve the corporate lane; the owner ruled the channels explicitly. Kill-criterion: if M3 finds no zero-dep NAT-friendly Slack shape, Slack drops to the corporate wave rather than importing a dependency.
**Verdict: PASS** — proceed to the gate bless.
