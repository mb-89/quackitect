---
unreachable_citations:
  - deliverable/engine/decisions.ts
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-iss-the-running-lane-is-not-the-code-the-walk-is-editing
type: "[[raid]]"
kind: issue
statement: The lane process loads the engine once at start and never reloads it, so every engine change a walk makes is invisible to that same walk, and the measurement i37 built has produced no measurement at all.
owner: the driving agent
trigger: the next iteration that changes the engine, which is nearly every iteration
status: open
looked: 2026-08-20
impact: An engine change is unverified on the live path by the walk that wrote it. Tests pass against the source; the lane keeps serving the old code. A walk can therefore ship a defect fix, watch its own tests go green, and never once exercise the fix.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - i37-training-iterations-a-disposable-iterati
place: i39-the-lane-tells-the-truth-about-itself-de
---

## What proves it

TWO FACTS FROM THIS BOX, both checkable in seconds.

- `deliverable/package.json` says version `6.0.0`. Every record the
  call log wrote today says `"se_version":"5.0.0"`, including one written
  minutes before this entry.
- `deliverable/engine/tools.ts` line 854 stamps `where:
  session.active()` on every served call. Across 16,157 records in this
  window, the count carrying that stamp is ZERO.

The process is `se-mcp.ts`, started once and still running. Node caches a
module after the first import, so the source on disk and the code in memory
part company at the first edit and never rejoin.

## Why it matters more than it looks

THE WALK CANNOT TEST WHAT IT BUILT. `se_test` runs the battery against the
files on disk, which is the right thing and is not the same thing as running
against the lane. A walk sees green and concludes the live path works.

i37 IS THE MEASURED CASE. Its central deliverable is cost per state, and cost
per state is derived from the walk-position stamp. The stamp is written,
tested, and design-specified. It has never once reached a log record, so
`costPerState` throws `Unpartitionable` on the very log it was built to
partition — correctly, and uselessly.

THIS IS THE SAME SHAPE AS [[raid-debt-core-and-satellite-is-off-the-live-path]]:
built, tested, and nothing the running server imports reaches it. That entry
names one feature. This one names the mechanism that produces the class.

## What would close it

Any one of these, and the cheapest is the first.

- THE LANE REPORTS ITS OWN AGE. A pull whose served version differs from
  `package.json` says so, once, on the banner. That is a comparison of two
  strings and it converts a silent class of failure into a visible one.
- A RESTART VERB. The agent cannot restart the lane from inside the cage
  today, and restarting it from outside drops the autonomy grant
  ([[wt-permission-granted-by-the-person-is-lost-whenever-the-server]]).
  A verb that restarts and re-asserts the dial fixes both.
- A VERIFICATION-STATE CHECK. The battery already runs there. A check that
  the served version matches the built one would have caught this on i37.

## The strongest proof, measured at the retro's step 10

THE PREVIOUS RETRO'S IMPROVEMENTS CANNOT BE TALLIED, because none of them ran.

Four landed in this working tree by merge at 09:50 on 2026-08-20, mid-walk.
Measured against the same window's log:

- The stall guard that names the item which cannot close: 0 of 115 stall
  refusals carried it.
- The served field that says whether the engine drew it or the agent writes it:
  0 responses carried the hint.
- SE-C-145, which types a search pattern that is not a regex: 0.

TWENTY-FIVE STALL REFUSALS FIRED AFTER 09:50, every one carrying the old
wording — "160 updates since anything closed, with 3 still open" — which is
exactly the sentence the improvement was written to replace. The improved guard
stands in `deliverable/engine/decisions.ts` line 541 and has never
executed.

SO THIS DEFECT DOES NOT ONLY BLIND THE WALK THAT MAKES A CHANGE. It blinds the
retro that would judge whether the change was worth making, which is the loop
this project improves itself through.

## What it does NOT ask for

HOT RELOAD IS NOT WANTED HERE. A lane that swapped its engine mid-walk would
change the rules under a walk that already read them, which is worse than the
staleness. The fix is to make the staleness VISIBLE, not to remove it.
