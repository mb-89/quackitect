---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-debt-a-parallel-fan-is-serialised-to-get-past-the-walker
type: "[[raid]]"
kind: debt
statement: The consistency sweep was rewired to run after the demonstrations rather than beside them, because the walker cannot resume a fan leg once the leg it took was a submachine, so the method lost a parallel branch to get past an engine defect.
owner: the owner
looked: 2026-08-20
status: open
breaks_how_badly: corrosive
how_likely: expected
impact: "Any drawing that fans into a submachine is unwalkable by one agent. The walk reaches the join with the other leg never taken, and every legal move is closed: the pull refuses SE-C-123, a choice refuses SE-C-110, the router draws a route the whole way round the record and moves zero hops, and se_reopen would take the walked leg down with it. The only ways out are editing the drawing or editing the engine."
source_refs:
  - note-ec92cfa43897
last_looked: 2026-08-23
look_verdict: rescheduled
---

## What was taken, and by whom

THE OWNER AUTHORISED THE CLOSE, 2026-08-18, leaving for the night: "end this
iteration completely by yourself... Everything that isn't clear, make a
decision and put it as technical debt."

THE WALK WAS STUCK AT `iterations/i16/run-demos/end` with no legal move. The
choice was between changing the drawing and rebuilding the walker's sub-stack
handling mid-record. The drawing was changed, because SE-C-123's own remedy
says to fix the drawing and because contract rule 2 forbids the unnamed
refactor the other option would have been.

## The defect, exactly

THE ENGINE ALREADY HAS AN ESCAPE FOR THIS. `session.ts` carries `joinStuck` at
line 6099 and `walkBackTo` at line 6112, and its own comment says what they are
for: "where the walk stands stuck the unsigned feeders ARE the offer, and
taking one puts the walk back on that leg."

IT CANNOT FIRE FOR A SUBMACHINE LEG. `joinStuck` asks whether the state the
walk STANDS ON owes a form:

    if (here === undefined || here.evidence_form.length === 0) return undefined;

Walking a submachine leg leaves the walk at that submachine's `end`. An `end`
owes no form, so the answer is `undefined` and no offer is ever made.

THE DEADLOCK IS COMPLETE, and that is why the existing fix does not reach it.
The busbar never ACTIVATES at all — `completeGuarded` throws SE-C-123 at line
1765 precisely because nothing activated. So the walk can never stand ON the
join, and `joinStuck` can never see a join that owes a form. The fix recorded
at line 3360 assumed the walk reaches the join and owes its form.

## What is owed

TWO CHANGES, and they are one piece of work.

- `joinStuck` must also answer where the leaf owes no form but completing it
  would starve a join. That join's unsigned feeders are the offer.
- `walkBackTo` must set the active state on the machine that OWNS the feeder.
  It currently sets it on the innermost sub, which is the wrong machine when
  the feeder lives one level up.

## What is NOT owed, so the debt is not overstated

THE CHAIN THAT REPLACED THE FAN IS RIGHT ON ITS OWN MERITS. The sweep
documents what the demonstrations produced, so running it first sweeps an
unfinished corpus. One agent walks both legs either way.

WHAT WAS LOST IS THE CAPABILITY, not this drawing. The parallel fan exists for
the day several agents walk legs at once, and that day is not today.

## Repayment

REPAYING IT IS THE TWO CHANGES ABOVE, PLUS A TEST THAT WALKS A FAN. The code
change alone is not repayment, because nothing in the battery walks a drawing
shape and that is why 1471 passing cases had nothing to say about this.

- `joinStuck` answers where the leaf owes no form but completing it starves a
  join, offering that join's unsigned feeders.
- `walkBackTo` sets the active state on the machine that owns the feeder,
  popping the sub stack to that level.
- A test drives a fan whose leg is a submachine, walks one leg, and asserts the
  other is still reachable.
- The sweep-consistency row may then go back to fanning, or stay chained on its
  own merits. That is a separate decision and this debt does not prejudge it.

IT IS PAID IN ONE SITTING by whoever opens the walking core, and it is not
payable from inside a record that is being walked — changing the walker while
standing on it is what this iteration declined to do.

## How it comes due

THE NEXT TIME ANYBODY DRAWS A FAN WITH A SUBMACHINE LEG. It will look correct,
compile, and strand the first agent that walks it.

## Sweep 2026-08-19, at i5's retro

RE-ACCEPTED, unchanged. i5 walked a seeded machine with a build-steps submachine and never fanned, so nothing here was exercised. It joins the standing list of walker limits alongside [[raid-iss-a-state-that-signs-no-form-can-never-be-sent-back]], which i5 found the same way — by hitting a move the walker has no way back from.

## Swept 2026-08-19, at i9's onboard-retro: RESCHEDULED

NEITHER CHANGE LANDED. The guard this entry quotes still stands, though it has
moved house: it is now at `engine/sessionclaims.ts` line 1220, carried out of
`engine/session.ts` by the i17 overhaul. The walk-back still takes its target
from the top of the host stack rather than from the machine owning the feeder.

THE CODE MOVED AND THE LOGIC DID NOT.

NO TEST WALKS A NESTED-MACHINE FAN LEG EITHER. The branching fixture rejoins
plain steps, and `tests/drawnsub.test.ts` says in its own comment at lines 301
to 304 that standing a fixture walk mid-record is its own piece of work.

THIS ENTRY CARRIES NO `trigger` FIELD, and its prose says it comes due the next
time anybody draws a fan with a nested leg. Nothing has.

A `looked` FIELD WAS ADDED HERE TODAY. It had none, along with the two other
entries minted at i16, so no sweep could tell when it was last read.

## Swept 2026-08-20, at the standalone retro after i37 shipped

THE NEIGHBOURING ENGINE DEFECT IS FIXED AND THIS ONE IS NOT. i37 fixed the
placeholder that could never be re-signed: `placeholderOwesItsOwnClaim` in
`deliverable/engine/session.ts` is now asked by all three paths, so a
state whose work is a sub-machine can be re-signed.

THAT IS THE SAME AREA AND A DIFFERENT DEFECT. This row is about RESUMING a fan
leg after taking a sub-machine leg, not about re-signing the leg itself. The
sweep did not confuse the two, and the method still carries the serialised
shape.

RE-AFFIRMED AS STANDING. Trigger unchanged.

