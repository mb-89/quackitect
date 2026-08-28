---
minted_in: i51-work-running-out-of-sight-reports-itself
id: raid-debt-the-route-drawer-reads-a-standing-as-a-boolean
type: "[[raid]]"
kind: debt
looked: 2026-08-25
statement: The route drawer asks whether a hop passes and receives a boolean, so a step whose leaving judgment is still being reached reads to it as failed rather than as deciding.
owner: the driving agent
trigger: a walk that redraws its route repeatedly while one long judgment is in flight
status: closed
impact: A route is redrawn that did not need redrawing, and the redraw is paid on the request path while a person waits. It is never a false green, because the flattening errs toward refusing a hop rather than allowing one.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - req-a-pending-verdict-is-recorded-against-its-state
  - req-call-answers-in-one-second
  - raid-asm-the-slow-tail-and-the-undrawn-route-share-one-cause
last_looked: 2026-08-24
look_verdict: repaid
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

## Repaid, and it was the one change this section named

`leavingStanding()` on the session is the drawer's own question. It asks
`stepStanding` about the state being left and returns all three words.

THE SWEEP USES IT. When a hop is refused, the sweep now asks whether the state
it was leaving is DECIDING. Where it is, the answer carries `deciding: true` and
says plainly that nothing is owed and nothing is wrong — the judgment has not
landed yet, so sweeping again is right and redrawing is not.

`conditionMet` IS UNTOUCHED, as this section prescribed.

WHAT IS NOT CLAIMED. That this removes the slow tail. The direction of cause was
never established, and the section below says so. What it removes is the
MISREADING: a caller can no longer be told a hop failed when the truth is that
nobody has answered yet.

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

## The trigger fired, and the cost is no longer unquantified

THIS ENTRY'S TRIGGER NAMES a walk that redraws its route repeatedly while one
long judgment is in flight. A round was walked exactly that way, and the calls
are on file.

COUNTED OVER 4,048 CALLS, using the state stamped on each record.

- 42 of 418 pulls answered that nothing routed toward the target.
- 15 of the 23 pulls that ran past thirty seconds are among those 42.
- A route-failing pull ran past thirty seconds 36 percent of the time. Every
  other pull did so 2 percent of the time.
- The slowest ran 131 seconds, and the surface shares the loop that was busy,
  so the panel was frozen behind it.

## Why the grading moved

IT READ `abrasive`, ON THE GROUNDS THAT THE COST IS WASTED WORK. That was the
honest reading while nobody had measured it.

WASTED WORK ON THE REQUEST PATH IS NOT THE SAME AS WASTED WORK. A standing
requirement says a call answers within a second or hands back something the
caller can watch. Two minutes of silence breaks that requirement outright, and
it takes the surface down with it because they share one loop.

SO IT IS `corrosive`: it does not destroy anything, and it degrades every
session that meets it.

## What is still NOT established

THE DIRECTION OF CAUSE IS UNTESTED. These pulls are slow AND fail to draw a
route. Which one causes the other is not shown by any count.

THAT GAP IS ITS OWN ENTRY, and a per-hop timing is what closes it. Repaying
this before that timing exists would be fixing the best-supported guess rather
than the known cause.

AND THE SIGNAL IS ONLY IN THE TAIL. At a five-second threshold there is no
difference worth reporting. Repaying this may leave ordinary slowness exactly
where it is.

## Looked 2026-08-25 — the trigger fired and the fix held

The trigger was a walk redrawing its route while one long judgment is in
flight. That happened at the desk-preparation step of this session's start-up:
five checks ran for several seconds and the walk pulled repeatedly against them.

Every answer said the check was still running and named the previous run's
output. None of them read the in-flight judgment as a failure, which is what
this entry was about. Re-affirmed closed on live evidence.
