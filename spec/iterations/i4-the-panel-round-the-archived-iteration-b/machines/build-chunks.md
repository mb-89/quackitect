---
steps:
  - id: the-widget-predicate
    statement: engine/widgets.ts owns the predicate, the registry read and the difference between them, so the rule lives in one place and both callers ask it rather than carrying a copy
    depends_on: []
    realization: code
  - id: the-view-model
    statement: engine/viewmodel.ts answers view(intent, filter) with the whole model, asking its seven sources and emitting no markup, no class names and no colour
    depends_on: []
    realization: code
  - id: the-exemption-list
    statement: a checked-in list declares the test fixture, the diagnostic page and the vendored component, and the guard reads it rather than holding an engine constant
    depends_on:
      - the-widget-predicate
    realization: code
  - id: the-guard-at-the-write
    statement: the write guard refuses a write that adds an emitter outside the registry, typed and carrying its remedy, and the sweep runs the same rule over the tree for what a write did not arrive with
    depends_on:
      - the-widget-predicate
      - the-exemption-list
    realization: code
  - id: the-set-building-call
    statement: the one call that cost 1163.6 ms of a 1190.2 ms render answers inside the second, measured the same way it was measured
    depends_on:
      - the-view-model
    realization: code
  - id: the-redraw-route
    statement: focus, scroll and an unsubmitted edit are kept in exactly one place, and the six sites that keep them today all read from it
    depends_on:
      - the-view-model
    realization: code
  - id: the-target-chip-and-the-route-line
    statement: the target chip is a clickable button drawn like the position button, and the blue route line to the target is drawn, both from fields the model already carries
    depends_on:
      - the-view-model
    realization: code
  - id: the-spawn-state-is-a-no-op
    statement: at a walker ceiling of zero a spawn state is skipped rather than walked and answered, so the walk shows only states that can do something
    depends_on: []
    realization: code
  - id: the-tbd-sweep-is-mechanical
    statement: an unresolved marker in a signed artifact is found by the sweep and named, rather than being found by a reader who happened to look
    depends_on: []
    realization: code
  - id: the-eighteen-are-decided
    statement: each of the eighteen unregistered emitters is routed into the one surface or removed, and the widget check goes green for the first time
    depends_on:
      - the-guard-at-the-write
      - the-view-model
      - the-redraw-route
    realization: code
---

# The build plan

TEN CHUNKS, TWO CHAINS THAT MEET AT THE END. The guard chain and the view
chain are independent until the last step, so they fan out to separate hands.

FOUR CHUNKS DEPEND ON NOTHING and start together: the predicate, the view
model, the spawn no-op and the marker sweep.

## The lenses that shaped the order

RISK FIRST PUT THE PREDICATE AT THE FRONT. It is the only mechanical defence
behind the round's fatal row, and its rule was already rewritten once by a
probe. A second wrong reading should surface while there is budget to react,
not at the collapse.

THE THINNEST END-TO-END SLICE IS THE SECOND LENS. `the-view-model` comes before
`the-set-building-call` so the model exists before anyone optimises it. A call
tuned before its caller exists is tuned against a guess.

THE KILL CRITERION DECIDED WHAT COMES LAST. `the-eighteen-are-decided` is where
this round either collapses the surface or does not. Everything before it is
preparation, and putting it last is what makes the preparation checkable.

## The edges that matter

`the-widget-predicate` BEFORE `the-guard-at-the-write`. The guard is a caller.
Building the caller first would leave it testable only against a hand-written
predicate, which is the shape that passes over a wrong rule.

`the-exemption-list` BEFORE `the-guard-at-the-write` TOO. A guard that refuses
before the hatch exists refuses the test fixtures on its own first run.

`the-redraw-route` BEFORE `the-eighteen-are-decided`. Six of the eighteen sites
are the ones that preserve state across a redraw. Deciding them without the
route decided would decide it eighteen times.

## What fans out

TWO HANDS CAN RUN FROM THE START. One takes the guard chain — predicate,
exemption list, guard. The other takes the view chain — model, then the set
call, the redraw route and the chip and line in parallel.

`the-spawn-state-is-a-no-op` AND `the-tbd-sweep-is-mechanical` TOUCH NEITHER
CHAIN. Both were deferred here by earlier states of this round. They can run
whenever a hand is free.

## What is not in the plan, and why

NO CHUNK CHECKS FOR DERIVATION INSIDE A REGISTERED MODULE. The predicate finds
emitters, and a registered editor that starts computing its own answers about
the walk passes it. That gap is named on [[el-widget-guard]] and it needs a
different check in a different round.

NO SPIKE WAS PROMOTED. Three ran this round and all three were throwaway
probes that answered a question. Two overturned a verdict this round had
already signed, and their answers are written into the nodes rather than into
the build.
