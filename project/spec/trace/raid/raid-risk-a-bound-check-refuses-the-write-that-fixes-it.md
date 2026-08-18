---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-risk-a-bound-check-refuses-the-write-that-fixes-it
type: "[[raid]]"
kind: risk
statement: A conformance check that refuses a write refuses the very write needed to fix the rule it enforces, and the walk has no way forward.
owner: the driving agent
trigger: the first bound check armed against a file the walk must edit to repair a break
status: open
impact: The walk stands in a state with no legal move. The only exit is out of the iteration, which the owner ruled a failure. Every check added after the first multiplies the surface.
breaks_how_badly: crippling
how_likely: expected
mitigation: "Every check names its way forward as part of being written. A check with no named escape does not compile. The compile-time trap check this iteration builds is the mechanical half; the authoring rule is the other."
source_refs:
  - raid-dec-the-walk-never-reaches-a-state-it-cannot-leave
  - i6 draft-vision — conflict 2, the walk wins
  - "i11 observe-red: the red check re-fired on re-entry and blocked its own iteration"
---

THE RISK, stated plainly. This product is its own product. A check armed
here fires on the agent building the checks.

## Why it is likely rather than possible

IT HAS ALREADY HAPPENED, once, in the neighbouring mechanism. i11 gave
observe-red an exit script that ran the record's new test-specs and
demanded a failure. On re-entry it fired again, found the tests now
green, and refused to let the walk leave. The iteration was blocked by
its own new machinery.

THE FIX THERE WAS SPECIFIC: a signed observe-red answers the re-entry.
That fix does not generalise. It was reasoned out after the block, from
inside the block.

THIS ITERATION ARMS MANY CHECKS AT ONCE, on the write path, which every
state uses. The same shape at greater surface.

## The distinction from the standing decision

`raid-dec-the-walk-never-reaches-a-state-it-cannot-leave` covers a STATE
demanding what it has no verb to supply. That is a machine-shape rule and
the compile-time check this iteration builds enforces it.

A CHECK IS NOT A STATE. It fires inside a verb, at write time, against
whatever file happens to be under the hand. No state declaration can see
it, so no compile-time check over the machine can catch it.

That gap is why this is a separate entry rather than a note on the
decision.

## Mitigation

EVERY CHECK NAMES ITS WAY FORWARD, and the naming is part of writing the
check rather than a review item afterwards.

Three ways forward are already known to work, and a check picks one.

- REPORT INSTEAD OF REFUSE, where the break predates this write.
- ACCEPT A SIGNED ANSWER, the shape observe-red ended up with.
- CARRY, the shape the close ended up with after the same failure.

A CHECK THAT PICKS NONE IS UNFINISHED. That is the authoring rule, and
the review that enforces it is this iteration's own gate-implementation.

## Trigger

The first bound check armed against a file the walk must edit to repair
a break. Revisit the mitigation then, with a real case rather than a
predicted one.
