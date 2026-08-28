---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: req-aiming-returns-before-the-walking-starts
type: "[[requirement]]"
statement: When a caller names a state as the target WITHOUT asking in the same call to be taken there, the engine shall answer in a time that does not grow with the distance to that target.
kind: quality
characteristic: performance-efficiency
verify_method: test
measure: naming a target walks nothing - the answer sweeps no state and does not report arrival - and the drawing it does is bounded by the graph, expanding each state at most once, so distance changes the size of the answer and not the shape of the work
breaks_if_removed: A caller that names a distant target is held for as long as the whole route takes, so the act of pointing costs the same as the act of going and neither can be done separately.
breaks_how_badly: corrosive
priority: must
refines:
  - uc-drive-the-machine-at-the-pace-of-thought
source_refs:
  - "owner ruling 2026-08-24: the aim itself should not take that long at all, it should basically be instant, and then when you pull, only when you pull and the system starts to calculate what it needs, then it can take a moment"
  - req-a-clear-jump-is-one-call
  - "measured 2026-08-24: 36 of 48 aims ran past five seconds and 28 ran past fifteen, against a proposed budget of a twentieth of a second per hop"
weighs_with:
  - req-a-clear-jump-is-one-call ! — this one bounds a BARE aim, that one bounds an aim that also asks to go; the two forms are separate acts and each keeps its own bound
  - req-call-answers-in-one-second ! — that puts a wall-clock bound on every admitted call; this says the aim's cost must not GROW WITH DISTANCE, which is a shape claim and not a bound
  - req-responsiveness ! — same ground against the budget table; a fixed duration cannot express that a cost is independent of how far away the target is
  - req-surface-answers-in-one-second ! — one is the walk's aim inside the engine, the other a person's render at the mirror; different boundaries
---

## Scenario

- Source: an agent or a person naming a state they want the walk headed toward.
- Stimulus: one call carrying that target.
- Artifact: the engine's walk.
- Environment: a record of any size, at any distance from the target.
- Response: the direction is recorded and the call answers.
- Response measure: nothing was swept and no arrival is reported, and the search expanded each state at most once.

## The measure was a median comparison, and the measurement took it away

THIS ROW ASKED FOR TEN RUNS AT EACH OF TWO DISTANCES, compared. The reasoning
was that drawing the route is the cost that grows with distance.

THE REASONING WAS MEASURED AND IT IS FALSE. Building a session costs 33
milliseconds. One expand costs 3.7 cold and 0.1 warm. A whole six-hop route
costs 68. The WALKING is what costs seconds, and a bare aim does not walk.

SO A MEDIAN COMPARISON HERE MEASURES THE MACHINE. Two millisecond-scale numbers
differ by more between one run and the next than the defect would move them, and
a test that fails on a busy laptop teaches its reader to rerun rather than look.

WHAT REPLACED IT IS THE THING THE ROW WAS ALWAYS ABOUT: the walking must not
happen inside the aim. That is checkable exactly, with no clock — nothing swept,
no arrival reported — and it fails precisely when the bug is present.

THE BOUNDEDNESS HALF stays as a count. The search expands each state at most
once, which is the property distance cannot change.

THE SPEC UNDER THIS ROW WAS AMENDED FIRST and this row was left standing, which
is how a spec and its requirement came apart. That gap is recorded as
[[raid-iss-two-requirements-still-demand-comparisons-no-test-performs]], and
closing it is what this section is.

## Detail

WHAT THIS ROW BOUNDS IS THE AIM AND NOTHING ELSE. It says nothing about how
long the walking may take, and nothing about how many calls a re-entry costs.

THE ANSWER SAYS WHICH THING HAPPENED. Direction taken is not arrival, and a
caller must be able to tell them apart without a second question.

## The measure was a made-up number and is now a comparison

IT READ `under 200 ms`. Nothing anywhere says 200. This row's own sources say
"basically instant" and "a twentieth of a second per hop", and neither is 200.
The figure was invented and then written as though it had been measured, which
is the fabricated-precision failure the authoring card names by that name.

WORSE, IT WAS INCONSISTENT WITH ITS OWN SIBLING. The per-hop row refuses to
borrow an unratified figure and says so in its body. Same round, same day,
opposite discipline.

WHAT REPLACES IT IS A COMPARISON, which needs no ratified number and tests the
thing the row is actually about: that pointing does not cost what going costs.
If the time does not grow with distance, no walking is happening inside the aim.

THE ABSOLUTE BOUND STILL COMES, from the per-hop budget once it is ratified.
This row does not need it and will not invent it in the meantime.

## There are TWO ACTS, and this row bounds only one of them

THIS LOOKED LIKE A CONTRADICTION BETWEEN TWO OWNER RULINGS AND IT IS NOT ONE.
The owner settled it on 2026-08-24: asking to jump is an ADDITION to aiming, not
a replacement for it. Both forms stand.

- AIM ALONE. Name the target, get an answer, walk nothing. This row bounds it.
- AIM AND GO, IN ONE CALL. Name the target and ask to be taken there. The
  resident row bounds that one, and this row says nothing about it.

BOTH ALREADY EXIST IN THE VERB. It takes a flag for whether to go, and going is
its default.

SO NEITHER RULING GIVES WAY. The earlier one guarantees a caller who knows both
things can say both at once. The later one guarantees a caller who only wants to
point is not held while a route is walked.

WHAT WAS ACTUALLY WRONG was neither design. It was that a BARE aim blocked
anyway, because the default carried it into the walking. That is what this row
forbids.

AN EARLIER DRAFT OF THIS ROW GOT IT WRONG in the other direction: it moved all
walking to the next call, which would have removed the combined form the earlier
ruling exists to protect. Corrected the same day, on the owner's word.

## What must not come back

THE PROBLEM THE EARLIER RULING SOLVED IS STILL A PROBLEM. An agent re-aiming one
state at a time relitigates hops the machine would have walked through by
itself, and that is what cost thirty-one pulls over twenty seconds.

SO THE PULL CARRIES THE WHOLE PASSING ROUTE OR THIS SPLIT IS A REGRESSION
WEARING AN IMPROVEMENT'S CLOTHES.
