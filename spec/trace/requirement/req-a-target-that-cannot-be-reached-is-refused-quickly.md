---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: req-a-target-that-cannot-be-reached-is-refused-quickly
type: "[[requirement]]"
statement: When no route can be drawn from where the walk stands to the target it was given, the engine shall say so as soon as that is settled, rather than running on after the answer is known.
kind: quality
characteristic: performance-efficiency
verify_method: test
measure: the search expands each reachable state at most once and never revisits one, so the answer that nothing routes is bounded by the size of the graph rather than by anything else
breaks_if_removed: The cheapest possible answer costs the most, so the walk is slowest exactly when it has nothing to offer and the caller waits longest for the least.
breaks_how_badly: corrosive
priority: must
refines:
  - uc-drive-the-machine-at-the-pace-of-thought
source_refs:
  - raid-asm-the-slow-tail-and-the-undrawn-route-share-one-cause
  - raid-debt-the-route-drawer-reads-a-standing-as-a-boolean
  - "measured 2026-08-24: 42 of 418 pulls answered that nothing routed toward the target, and 15 of the 23 pulls past thirty seconds were among them"
---

## Scenario

- Source: an agent asking for the next step toward a standing target.
- Stimulus: a target no route reaches from the current position.
- Artifact: the engine's route drawer.
- Environment: normal operation, including while a leaving judgment is still being reached.
- Response: an answer saying nothing routes toward the target, with the doors this position does offer.
- Response measure: each reachable state expanded at most once, so the search stops when the reachable set is exhausted and not after.

## This row carried a contradiction and the owner struck it

OWNER RULING 2026-08-24: "if we find a reason why there is no way to get there,
we just return early". And on the row as it stood: rework it or remove it, but
leave no requirement standing with a contradiction in it.

WHAT THE CONTRADICTION WAS. The measure demanded that reporting no route cost no
more than reporting one. No graph search can do that. To say there is no way,
the engine must look everywhere it can reach; to say here is the way, it stops
at the first one it finds. Finding nothing therefore always costs more.

WORSE, THE TEST UNDER IT ASSERTED THE OPPOSITE ORDERING, and passed. On its own
fixture the failed search expanded 41 states against about two for the near one,
so the old measure was false in the very data the green test rested on.

WHAT THE ROW ALWAYS MEANT is in its own evidence, which is about a tail and not
about ordering: 15 of the 23 pulls past thirty seconds were pulls answering that
nothing routed. Thirty seconds is not search cost — a whole route on this graph
draws in 68 milliseconds. The complaint was a hang, not a few milliseconds.

SO THE MEASURE IS NOW THE BOUND THAT CATCHES A HANG and is also true: each
reachable state expanded once, never twice. A search that revisits is the
unbounded case, and it is the only way this can run long.

## Detail

THE BOUND IS THE GRAPH, deliberately. An absolute time would have to be guessed,
and a comparison against the successful case is not satisfiable. Counting states
expanded holds whatever the route drawer costs, needs no ratified number, and
fails exactly in the one case that can run long: a search that goes round again.

THIS REPLACED A COMPARISON, and the section above says why.

THE ANSWER'S CONTENT IS NOT WHAT THIS ROW IS ABOUT. Saying which doors ARE open
is already required elsewhere. This row is only about the saying not running on.

## What was measured

A TENTH OF ALL PULLS ANSWERED THAT NOTHING ROUTED, and those pulls are two
thirds of the slow tail. A route-failing pull ran past thirty seconds 36 per
cent of the time, against 2 per cent for every other pull.

THE SIGNAL IS ONLY IN THE TAIL. At five seconds there is no difference worth
reporting, so this row does not claim to fix ordinary slowness and should not be
credited with it.

## What is NOT claimed here

WHY THOSE PULLS ARE SLOW IS NOT ESTABLISHED. They are slow AND they fail to draw
a route, and no count separates the two. A standing debt names a mechanism that
would explain it, and a second explanation — a shared loop under load — explains
it equally well.

SO THIS ROW DEMANDS THE OUTCOME AND NAMES NO MECHANISM. Which of the two is at
fault is the round's own measurement work, and naming a mechanism here would
freeze design into an obligation before anyone knows which design is right.
