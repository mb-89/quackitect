---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: raid-asm-the-slow-tail-and-the-undrawn-route-share-one-cause
type: "[[raid]]"
kind: assumption
statement: The pulls that run past thirty seconds are slow BECAUSE the route could not be drawn, rather than both being caused by something else.
owner: the driving agent
trigger: the first per-hop timing that attributes a slow pull to something other than drawing the route
status: open
probe: SCHEDULED to the spike milestone, 2026-08-24. The controlled probe must hold a judgment live across BOTH halves while varying only whether a route can be drawn, which is staging rather than minutes. WHAT CHANGED WHILE IT SAT - the sibling assumption about a shared loop was probed the same day and held, which promotes contention from a rated-unlikely rival to the only one of the three with a confirmed mechanism. It does not explain the SHAPE of the tail, since contention would slow every call rather than one kind. So the two are probably both true and the spike separates their contributions rather than picking a winner.
probed: 2026-08-24
impact: This round is ordered around it. If it is false, the repayment lands and the walk stays slow, and the round has spent its first milestone on the wrong suspect.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - raid-debt-the-route-drawer-reads-a-standing-as-a-boolean
---

## How to re-run these numbers

THE QUERY, so nobody has to have been here.

    se_log_query {filter: {since: "2026-08-23T13:19:18.779Z", tool: "se_pull"}}
    se_log_query {filter: {since: "...", tool: "se_pull", min_ms: 30000}}
    se_log_query {filter: {since: "...", tool: "se_pull", text: "nothing routes toward"}}
    se_log_query {filter: {since: "...", tool: "se_pull", text: "nothing routes toward", min_ms: 30000}}

THE BOUNDARY is the oldest record after the previous judged drain, which is how
the retro method fixes a window.

THE COUNTS WILL NOT MATCH FOREVER. The live log rotates, and a later reader
over a shorter window measured 296 pulls where this saw 418. The five-second
rate reproduced at 31 percent against 33; the thirty-second tail did not. Say
which window a number came from or it is not a number.

## What is measured, and it is only a correlation

COUNTED OVER 4,048 CALLS in one window, using the state stamped on each record.

- 418 pulls. 23 of them ran past thirty seconds.
- 42 pulls answered that nothing routed toward the target. That is 10 percent
  of all pulls.
- 15 of those 42 are in the 23. So a tenth of the pulls account for two thirds
  of the slow tail.
- A pull that failed to draw a route ran past thirty seconds 36 percent of the
  time. Every other pull did so 2 percent of the time.

EIGHTEENFOLD IS NOT A COINCIDENCE, but it is not a mechanism either.

## The signal lives ONLY in the tail, and that matters

AT FIVE SECONDS THERE IS NO SIGNAL AT ALL. 40 percent of route-failing pulls
pass five seconds against 33 percent of pulls generally, which is nothing.

SO MODERATE SLOWNESS HAS MANY CAUSES and this is not one of them. Whatever this
is, it only shows up at the extreme, which is consistent with a search that
runs long before giving up.

DO NOT LET THE HEADLINE NUMBER HIDE THAT HALF. Repaying the debt may leave the
33 percent exactly where it is.

## Why it is an assumption rather than a finding

THE DIRECTION IS UNTESTED. A pull that cannot draw a route may be slow because
drawing failed, or drawing may fail because something else already made the
call slow. Nothing here separates the two.

THE NAMED MECHANISM FITS. The standing debt says the drawer flattens a step
that is still deciding into a failure, which would make a route past that step
undrawable while a judgment runs.

WHAT WOULD SETTLE IT. A per-hop timing that says where the time inside one slow
pull actually went. That is this round's second item, and it is the reason the
repayment is not the first thing built.

## Probe

TIME ONE HOP FROM THE INSIDE, splitting a pull's duration across the three
suspects: drawing the route, evaluating a hop's conditions, and starting the
processes those conditions spawn.

RUN IT ON A PULL THAT FAILS TO DRAW A ROUTE and on one that succeeds, with a
long judgment live in both cases so the only difference is the drawing.

WHAT CONFIRMS IT. Drawing dominates the failing pull and not the succeeding
one. That puts the time inside the search rather than beside it.

WHAT FALSIFIES IT. The failing pull spends its time somewhere else, most
plausibly in spawning condition scripts, and drawing is merely what happens to
be reported when a slow call finally answers.

WHAT LEAVES IT OPEN. Both are slow and neither dominates, which would say the
cost is spread and no single repayment fixes it.

### The cheap version was struck at the motivation gate

IT WAS THIS: pull toward a target beyond a live judgment and time the answer,
then pull again with nothing running. It was called enough to settle the
question, and it is not.

IT VARIES THE WRONG THING. What changes between its two halves is whether a
judgment is live, not whether the route can be drawn. Both hypotheses predict
the same result, so a confirm licenses nothing.

THE THIRD MECHANISM IT CANNOT SEE. A spawned judgment saturates the loop the
engine and the surface share, so every pull is slow while one runs, whatever
the route does. This entry already knew that loop is shared and never turned
the fact on its own experiment.

COUNTER-EVIDENCE STANDS IN THE LOG. Of seven pulls past thirty seconds in one
reachable window, six drew their routes perfectly well and returned a walked
list, and every one of the six carried a live judgment in the same answer. Only
one was a route failure. That is the load mechanism sitting in the tail with
the route failure absent.

SO THE CONTROLLED PROBE ABOVE IS THE ONLY ONE THAT COUNTS, and its live
judgment in BOTH halves is the whole reason it works.

## Three hypotheses, not two

- THE ROUTE SEARCH IS SLOW when it cannot find a path, and gives up late.
- THE LOOP IS CONTENDED while a judgment runs, and everything is slow.
- THE CONDITION SCRIPTS ARE SLOW to spawn, and the count of them varies.

THE PROBE MUST SEPARATE ALL THREE. Holding the judgment live in both halves
removes the second. Timing the spawn separately removes the third. What is left
is the first.

WHO CHECKS IT. The driving agent, at this round's measurement step, before any
repayment is written.
## Probed 2026-08-24: SCHEDULED, and a rival mechanism gained ground

THE CONTROLLED PROBE NEEDS STAGING, not minutes. It has to hold a judgment live
across both halves while varying only whether a route can be drawn, and neither
half can be arranged from a state that is only allowed to read and run. That
makes it a spike rather than a probe, and the spike milestone carries it.

WHAT CHANGED WHILE THIS SAT UNPROBED. The sibling assumption about a shared
loop was probed the same day and HELD, at four and a half times its baseline.

THAT STRENGTHENS THE RIVAL. Loop contention was named here as the third
hypothesis and rated no better than the others. It is now the only one of the
three with a confirmed mechanism behind it: the surface and the engine
demonstrably share a loop, and two records show one wait measured at both
layers within five milliseconds.

WHAT THAT DOES NOT DO. It does not explain why route-FAILING pulls are eighteen
times likelier to run past thirty seconds than any other pull. Contention would
slow every call under load, not one kind of call.

SO THE TWO ARE NOT RIVALS ANY MORE, THEY ARE PROBABLY BOTH TRUE. Contention
plausibly accounts for the general slowness, and something about the failed
search accounts for the shape of the tail. The spike has to separate their
CONTRIBUTIONS rather than pick a winner.

THAT IS A CHANGED QUESTION and it is a better one. The entry was written asking
which of three mechanisms is the cause. It should now ask how much each of two
contributes.

## Standing

SCHEDULED to the spike milestone. Status stays open. The entry is not closed by
having been thought about.
## What the `probed` stamp on this entry means

IT IS THE DATE THIS ENTRY WAS LAST EXAMINED. The outcome is in the probe field,
and that field says scheduled.

A FORM CLAIMED THE STAMP WAS WITHHELD FROM THIS ENTRY. It is on the file, and
the form is the half that is wrong.
## The milestone it was scheduled to does not exist at this size

CAUGHT 2026-08-24, one state after the scheduling. The round is walked at minor,
and minor compiles no prototype phase. The walk went from architecture straight
to implementation, so the spike milestone this entry names was never in the
machine.

SCHEDULING WORK TO A MILESTONE THE COLUMN DROPPED is a promise that cannot be
kept, and it would have read as kept. Nothing would have failed: the entry would
stand open, pointing at a phase nobody walks, and the next reader would assume it
was waiting rather than stranded.

WHERE THE PROBE GOES INSTEAD. The implementation phase, where the verbs that
run a command and ask a question are legal and the measurement can actually be
made. That is a demotion from a staged spike to a narrower probe, and it is the
honest one: what fits there is a timing, not an experiment with a held control.

WHAT IS LOST BY THAT MOVE, said rather than hidden. A probe that holds one call
while timing another needs staging this round has no state for. So the
contribution question may come back partly answered, and if it does, this entry
stays open into another round rather than being closed on a half result.

## The general shape, which is bigger than this entry

ANY STATE MAY SCHEDULE WORK TO A MILESTONE ITS OWN SIZE HAS DROPPED, and nothing
checks it. The size is chosen at the kickoff and the machine compiles to match,
but a form written at M3 can name a phase that M4 removed.

THAT IS NOT THIS ROUND'S TO FIX and it is worth somebody's. It is captured for a
retro rather than argued here.