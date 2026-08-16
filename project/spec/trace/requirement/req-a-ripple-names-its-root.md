---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: req-a-ripple-names-its-root
type: "[[requirement]]"
statement: When a claim is dropped because an input of its own is not standing, the engine shall name the ROOT of that chain rather than the first hop, and shall choose the repair verb by asking the root.
kind: functional
verify_method: test
breaks_if_removed: The reader repairs a state that is merely waiting, sees nothing change, and asks again. Each hop costs a call, and the verb chosen for a waiting state is right about the wrong subject — which is how a reopen lands on a claim an amend would have fixed, taking a person's bless and everything downstream with it.
breaks_how_badly: crippling
refines:
  - uc-take-a-step
source_refs:
  - project/deliverable/engine/machine.ts
  - req-fallen-condition-named
  - req-a-value-outside-its-vocabulary-refuses
priority: must
---

## Detail

A FALLEN CLAIM USUALLY FELL BECAUSE ITS INPUT FELL, and that one because
its own did.

The refusal named the immediate feeder. So it was accurate about one hop
and silent about the rest, and the reader had to know to keep asking.

## Lived, in this iteration

2026-08-16: a value outside its vocabulary trapped this walk for ELEVEN
calls, four states later. Three repairs were aimed at states that were
fine.

`se_why` found it in two calls, because `se_why` already walked the chain
and the refusal did not.

## What a root is

A FALLEN CLAIM WITH NO FALLEN INPUT OF ITS OWN. That is where work has to
happen. Everything between it and the state that asked is waiting.

TRANSPARENT STATES ARE LOOKED THROUGH. `start` and plain waypoints carry
no claim, so they can never be green and can never be a root — naming one
points the reader at a state with nothing to fix.

A CYCLE HAS NO ROOT. The walk terminates and returns none, and the
refusal falls back to the first hop, which is still better than silence.

## What rides with it

THE PATH, root first. A reader seeing four hops can tell at once that the
state in front of them is not the problem.

THE VERB, chosen by asking the ROOT rather than the first hop. The engine
can ask a fallen claim whether its own content still passes:

- Content passes, claim signed — `se_amend`, which leaves the tree
  standing.
- Content fails — `se_reopen`, because that is a defect rather than a
  ripple.
- No standing claim at all — neither. There is nothing to amend and
  nothing to re-earn; the state has not been walked. `se_aim` goes there.

THE THIRD CASE ONLY APPEARS ONCE THE ROOT IS NAMED. The first hop is
always a state the walk has been through, so it always had a form.

## Behaviour

NO MODEL WANTED. A breadth-first walk up the claim graph to a fixed
point, over a set the engine already computes.
