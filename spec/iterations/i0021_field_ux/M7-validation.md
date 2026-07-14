# M7 — validation

## Acceptance obtained  → i21-m7-acceptance

The sign-off is a LIVE one: the owner drove the iteration's deliverable for a full working
day (2026-07-14) and adjudicated with it, on it.

- The hand-off DECISION BRIEF went through nine owner design rounds at the M6 gate.
  Every round's ruling is recorded (NOTE-20260714-150051 and the M6 evidence); the owner
  closed the rounds with "this looks good" and ruled the final shape: decisions only,
  options with a lettered ruling, one bless, tasks panel.
- The owner blessed `i21-m6-gate` FROM THE PHONE over the brief card
  (actor=user, channel=ntfy in the ledger) — the iteration's core use case
  ([uc-work-register](uc-work-register.md)) demonstrated end to end: proposals arrived,
  the ruling recorded itself (`q-io-lane-scope` decided_via B, provenance
  `user-ruling via handoff ntfy`), the gate closed.
- The overnight M1–M5 killer batch was reviewed and CONFIRMED by the owner the same
  morning (NOTE-20260714-164016).
- Field friction found during the live run was fixed in-iteration and re-accepted by
  the owner in the same session: the channel-clock ask staleness (a fresh phone tap
  was eaten by a skewed pc clock), the dual-channel pager, the battery's progress,
  determinism, and self-recursion guard (verification closed 179/179 green after).

Verdict: accepted in use, not in a demo — the strongest sign-off this method knows.

## Consistency swept  → i21-m7-consistency

Changed behavior this iteration: the standing register died into the hand-off brief, the
battery went lazy-everywhere with V&V-once, killers rule over hand-off channels, asks carry
the brief. Sweep findings, all fixed in place:

- [compose-reference.md](../../../product/quackitect/method/prompts/compose-reference.md):
  the prefill section taught the RETIRED report-register and the old killer routing —
  rewritten to the hand-off brief, Options authoring, and the hand-off-channel killer rule.
- [engage.md](../../../product/quackitect/method/prompts/engage.md): the engage health
  check demanded a full `quack selftest` — retired; the battery is V&V-once via `quack
  verify` (req-lazy-verdicts). The ADJUDICATE step was rewritten earlier the same day
  (dual-channel pager, block-and-continue).
- [AGENTS.md](../../../AGENTS.md): `quack verify` added to the command surface; MCP lane
  and window-for-long-runs rules added.
- [req-register-render](req-register-render.md): statements 1–2 taught the superseded
  core-first row layout — amended to the ruled decision-brief shape.
- Checked and consistent: roles/README (targeted verify, battery at hand-back),
  milestone-review guide (no battery mention), templates ("register" hits are other
  senses: needs register, risk register, language register).

## Validation gaps as RAID  → i21-m7-gaps

Four honest gaps from the live day, each a RAID node with proposed kind and mitigation —
they arrive red on this gate's own hand-off, so the bless that closes the gate rules them:

- [raid-busy-record](raid-busy-record.md) — a busy-guard's vacuous answer can record as a
  real verdict; class fix queued, two instances guarded.
- [raid-timing-tests](raid-timing-tests.md) — real-time watchdog tests can flake under load.
- [raid-dual-channel-race](raid-dual-channel-race.md) — a seconds-wide double-bless window
  between page and phone.
- [raid-pc-clock](raid-pc-clock.md) — the machine clock runs an hour fast; asks are shielded,
  local timestamps are not; owner resync open.

## Killer use-cases demonstrated  → i21-m7-killer-ucs

[uc-work-register](uc-work-register.md) ran for real, repeatedly, today:

- M6: the owner blessed from the PHONE card; the open ruling (`q-io-lane-scope`) recorded
  itself in their name, provenance on the node.
- m7-gaps was the purest session: four red RAID proposals dealt as cards, the owner flipped
  through them and one bless recorded all four rulings (`user-ruling via handoff` on every
  mitigation).
- m7-acceptance and m7-consistency: page taps, dual-channel rounds, the losing channel's
  card died each time.

Not a staged demo — the iteration's own gates were adjudicated THROUGH the deliverable,
across both channels, with rulings landing as node provenance.

## Meets the need  → i21-m7-meets-need

Every need's Ch1 success criteria, checked:

- [need-note](../../trace/need-note.md) — HOLDS. One command to a durable note; used
  eight times today without leaving the check in hand.
- [need-implementation](../../trace/need-implementation.md) — HOLDS. observe-red enforces
  the red-first law; today's four amended tests carry explicit exempt markers with the
  ADR citation, the mechanism the law prescribes.
- [need-review](../../trace/need-review.md) — HOLDS, with a ruled nuance. One command
  still renders the live board; gate states recompute on every render. Test verdicts now
  come from the cache (req-lazy-verdicts): a moved hash reads "unverified at this build"
  honestly instead of re-running the battery. Freshness of STATE stayed; freshness of
  VERDICTS is explicit V&V.
- [need-docu](../../iterations/i0012_spec_book/need-docu.md) — HOLDS. Validated by the
  i19 cold-read; the book lints stayed green through today's battery.
- [need-engage](../../trace/need-engage.md) — criterion (b) HOLDS at its strongest:
  a real gate (`i21-m6-gate`) was adjudicated from the phone, end to end, answer recorded
  as the adjudication. Criterion (a) carries a TENSION the owner rules at this gate:
  i21's M1–M5 killer gates are stamped `actor=agent` — blessed overnight under the
  owner's explicit standing grant and CONFIRMED by the owner the next morning
  (NOTE-20260714-164016). The stamp is honest involvement; the adjudication was the
  owner's, delegated. Blessing this gate accepts that reading; ordering M1–M5 re-blessed
  by hand is the alternative. RULED: the owner blessed meets-need with the tension named
  on the hand-off — the delegated-grant reading stands.

## Review rounds and verdict  → i21-m7-gate

1. Verify — every subtask delivered against its evidence: acceptance (live sign-off),
   consistency (four docs fixed, verification re-green), gaps (four RAID nodes, rulings
   recorded), killer-ucs (demonstrated by the day itself), meets-need (five criteria,
   one ruled tension). All five blessed by the owner on hand-off rounds, both channels
   exercised.
2. Validate — the iteration's promise (filling becomes vetoing, never authoring into
   blanks) held in use: no blank form was authored by the owner today; every ruling
   arrived as an accept or veto of a proposal.
3. Challenge — what a red-teamer pokes, all captured: the RAID quartet (busy-record,
   timing flake, dual-channel race, pc clock), the voice defect in the RAID statements
   (owner correction noted, retro item), and the still-open notes inbox (selftest block
   outside review, MCP lane, battery UX leads).

Verdict: M7 validation complete. The deliverable was validated by adjudicating the
iteration through it.

