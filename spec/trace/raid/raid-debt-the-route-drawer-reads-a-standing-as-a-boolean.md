---
minted_in: i51-work-running-out-of-sight-reports-itself
id: raid-debt-the-route-drawer-reads-a-standing-as-a-boolean
type: "[[raid]]"
kind: debt
statement: "The route drawer asks whether a hop passes and receives a boolean, so a step whose leaving judgment is still being reached reads to it as failed rather than as deciding."
owner: the driving agent
trigger: a walk that redraws its route repeatedly while one long judgment is in flight
status: open
impact: "A route is redrawn that did not need redrawing. The cost is wasted work, never a false green, because the flattening errs toward refusing a hop rather than allowing one."
breaks_how_badly: abrasive
how_likely: expected
source_refs:
  - req-a-pending-verdict-is-recorded-against-its-state
last_looked: 2026-08-23
look_verdict: rescheduled
---

## Why it stands

`req-a-pending-verdict-is-recorded-against-its-state` names three readers of a
step's standing. Two of them now receive the word.

- THE GATE receives it. `feedersUnsigned` asks `stepStanding` and a feeder still
  deciding does not count as finished.
- THE PULL receives it. The packet carries the standing beside the boolean.
- THE ROUTE DRAWER DOES NOT. `route(target)` reaches its hop checks through
  `conditionMet`, which returns a boolean and flattens `deciding` into `false`.

## Why it is debt rather than a defect

THE REQUIREMENT ITSELF NAMES THIS DIRECTION AS THE SAFE ONE: "A reader that
treats it as failed refuses a walk that has done nothing wrong." A route that
refuses a hop is redrawn on the next pull, and the judgment settles meanwhile.

THE OTHER DIRECTION WOULD BE THE DEFECT. A reader that treated `deciding` as
passing would walk past a check nobody has answered.

## Repayment

REPAYING THIS IS ONE CHANGE: give the route drawer its own question about a
step's standing, and leave `conditionMet` alone.

`conditionMet` returns a boolean and is called from many places. Widening it to
the three-word standing touches every caller, and the only one that wants the
third word is the route drawer. The honest fix is a separate question the route
drawer asks, not a wider return type on the shared one.

## How it was found

The fresh-eyes verification of this record could not reach it on its first pass
and traced it on its second, reporting it STILL OPEN with the severity above.
