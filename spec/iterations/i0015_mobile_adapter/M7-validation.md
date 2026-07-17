# M7 — Validate & accept (i0015_mobile_adapter, systematic)

## Killer use-cases demonstrated end-to-end  → i15-m7-killer-ucs

Not a staged demo — the REAL thing, 2026-07-09: the i15-m6-gate hand-off ran on both lanes. The owner scanned the pairing QR (the hand-rolled encoder proven on real glass) and subscribed. The owner saw the high-priority GATE ask with its buttons and tapped **bless**. The background `quack await` picked the tap off the held-open stream and recorded: `mobile bless recorded: i15-m6-gate (actor user, via ntfy)`. The build's own implementation gate was adjudicated through the build. uc-mobile-adjudicate: exercised for real.

## Meets the need  → i15-m7-meets-need  (killer)

- [need-engage](../../trace/need-engage.md)'s new criterion — "a gate ask reaches the paired phone and the answer records as the adjudication, end-to-end on a real gate; demonstrated on ntfy" — is MET by the event above.
- The original criterion stands untouched: every killer gate carries a user adjudication (the mobile lane records actor=user; the self-cert metric is blind to the channel, as designed).
- Validated against ALL needs across every iteration: `validates: needs` folds the need-set digest into this check; the board is green under it.

## Acceptance obtained  → i15-m7-acceptance

The adjudicator's sign-off evidence:

- the mobile bless event itself (actor=user, channel=ntfy, in the ledger)
- the owner-driven review rounds through M1–M6 in this record

The M7 gate bless below completes it.

## Validation gaps captured  → i15-m7-gaps

- The QR gap CLOSED live (the scan worked; the structural test was honest about not proving this).
- Remaining, recorded as RAID-adjacent notes for the field: relay retention rides the disclaimer (accepted); the Slack lane is deferred with its tripwire armed (adr-dmvbh5y, adr-slack-text-poll); `await`'s reconnect path has a test plus one live run — long-haul behavior (hours-long awaits, flaky networks) is field territory, the fallback drain bounds the damage.

## Milestone review

**Verify.** Every claim above has one of these behind it:

- a ledger event
- a topic event
- a test

**Validate.** The need is met by demonstration, not assertion. No older need regressed (backward-cumulative validation green).
**Red-team.** Opposing case: "one successful tap is anecdote, not validation." Held: the tap ran one unbroken chain through every part:

- pairing
- QR
- dispatch
- rendering
- the stream
- first-wins
- apply
- the ledger

The fourteen-test battery covers the parts. The chain needed exactly one honest run. Kill-criterion: a field week with a dropped answer reopens the loop's robustness at refine.
**Verdict: PASS** — proceed to the gate bless.
