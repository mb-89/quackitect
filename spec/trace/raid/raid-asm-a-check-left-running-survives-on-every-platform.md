---
minted_in: i51-work-running-out-of-sight-reports-itself
id: raid-asm-a-check-left-running-survives-on-every-platform
type: "[[raid]]"
kind: assumption
statement: A leaving judgment left running after its call has answered keeps running to completion on every platform the product supports, and its verdict is still readable afterwards.
owner: the driving agent
trigger: the first verdict that never arrives after its call answered, on any platform
status: open
probed: "2026-08-21, PARTLY. Handed-off work survived its call on Linux for ninety seconds and its verdict was readable. The leaving-check path itself was not exercised, and no other platform was."
probe: "Start a leaving check, let its call answer, then read the verdict on each supported platform. A verdict that never lands names the platform where leaving work running does not survive."
impact: "The deferred verdict is the iteration's load-bearing goal. On a platform where the work does not survive its call, the walk answers fast and then waits forever for a verdict that will never come, which is worse than the freeze it replaced."
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - req-a-leaving-check-does-not-hold-the-call
  - req-a-pending-verdict-is-recorded-against-its-state
  - i51
---

## Why it is open

Today the call and the judgment live and die together, because the call waits
for it. Nothing has ever had to survive the other.

After this change they are separate lifetimes, and whether the second outlives
the first is a property of the platform rather than of this code.

## Where it bites

The product already carries a recorded doubt about exactly this seam. Whether a
POSIX host reaps spawned work when the session that started it closes is
written down as never having been exercised, in
`exp-the-posix-branches-have-never-run`.

Every machine that has run this engine was Windows. The POSIX path is written
and unexercised, and this iteration is the first thing to depend on it.

## Why it is an assumption and not a risk

A probe can be written and it is cheap. That is the test the method sets: a
worry with no writable probe is a risk, and this one has one.

## Probe

Start a leaving check. Let its call answer. Read the verdict afterwards, on
each supported platform.

Two outcomes, both useful.

- The verdict lands everywhere, and the load-bearing goal rests on something
  observed rather than assumed.
- It does not land somewhere, and that platform needs the work held by
  something that outlives the call. Finding that before building is worth far
  more than finding it after.

## PROBED 2026-08-21, PARTLY — AND IT STAYS OPEN

THE POSIX BRANCH IS NO LONGER UNEXERCISED, which is the part worth recording.
This run is on Linux.

WHAT WAS OBSERVED. A test run was started, its call answered in 7 ms, and the
work was still going and still readable ninety seconds later. Its own progress
record was being appended throughout. Handed-off work survives its call on
POSIX.

WHY THE ENTRY STAYS OPEN ANYWAY, and this is the honest half.

- THE PATH IS NOT THE SAME ONE. A test job and a state's leaving check are
  started by different code. The leaving check is awaited inline today, so the
  thing this entry is about has never run detached at all.
- ONE PLATFORM IS NOT EVERY PLATFORM. The statement names every platform the
  product supports, and only Linux was seen.

WHAT IT DOES BUY. The nearest analogue works here, so the risk is smaller than
it was. It is not discharged.
