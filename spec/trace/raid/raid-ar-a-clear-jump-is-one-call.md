---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-ar-a-clear-jump-is-one-call
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-a-clear-jump-is-one-call at risk — the response hinges on el-walk-engine.
owner: the adjudicator
trigger: an se_aim call answering arrived false, or the daily ledger showing se_aim over three seconds
status: open
impact: the sweep recomputes the route after every hop, so jump cost scales with route length and the three-second half of the measure is unowned
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-a-clear-jump-is-one-call
  - el-walk-engine
  - raid-debt-core-and-satellite-is-off-the-live-path
---

## What holds and what does not

THE CALL-COUNT HALF IS BUILT AND TESTED. `engine/tools.ts` line 228 records the
design: the caller names the target and asks to be taken there in the same call,
so the sweep runs there rather than waiting for a pull.
`tests/clear-jump.test.ts` line 65 asserts the landing.

THE THREE-SECOND HALF IS OWNED BY NOTHING. No case in that test file times
anything, and the engine's own budget is nearly seven times the measure:
`engine/session.ts` line 2749 sets `SWEEP_BUDGET_MS = 20_000`.

## Why the cost is structural rather than waste

A SWEEP RECOMPUTES THE ROUTE AFTER EVERY HOP, so a long route pays the green
walk once per hop. i33's `fix-what-the-numbers-name` line 27 states the reason
plainly: that is not waste, it is the detour that stops a moved ground being
followed off a cliff.

SO THE TRADEOFF IS CORRECTNESS AGAINST LATENCY and it was taken deliberately.
The twenty-second budget buys a stop on a whole state rather than a cut-off
mid-hop.

## It is already measured broken

FIVE `se_aim` CALLS PASSED FIVE SECONDS ON 2026-08-17, recorded in i33's
`fix-what-the-numbers-name` line 17. Past the budget the call answers
`arrived: false`, which is exactly the second call the requirement forbids.

## What would make it fire

RE-ENTERING A LONG RECORD AFTER A STEP OUT. A forty-four-hop route of
already-standing states pays one green recompute per hop.

## The other named element contributes nothing today

`el-satellite` IS OFF THE LIVE PATH.
[[raid-debt-core-and-satellite-is-off-the-live-path]] records that the cluster
is built and tested and nothing the running server imports reaches it. That does
not change the verdict, and it means the hinge is el-walk-engine alone.
