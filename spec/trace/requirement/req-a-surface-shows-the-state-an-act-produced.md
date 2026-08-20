---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: req-a-surface-shows-the-state-an-act-produced
type: "[[requirement]]"
statement: When an act on a control changes the state that control reads from, the product shall render the changed state on that surface before the actor is able to act on it again.
kind: functional
verify_method: test
breaks_if_removed: A surface drawn from stale values reports a legal act as a refusal, so the actor presses again to check — and on a cumulative control that second press releases what the first one set.
breaks_how_badly: crippling
priority: must
refines:
  - uc-act-on-a-control-and-know-what-it-did
source_refs:
  - sty-the-control-that-says-why-it-declined
  - vp-rigor-without-toil
---

## Detail

THE FAILURE IS RECORDED THREE TIMES IN THIS PRODUCT and never as a latency
complaint.

- The emergency rung was drawn from an absent value, so an armed engine kept
  showing a plain button. The owner pressed it again to check, and that press
  disarmed it.
- The shutdown row had the same hole and could never show a pressed button.
- The stop-at bank's fourth notch would not respond from the third on
  2026-08-17, and no surface said whether that was a rule or a fault.

Sources for all three: engine/mirror.ts lines 756 to 762, and the owner's own
report of the third.

WHAT RENDERING THE CHANGED STATE MEANS. The surface shows the state as it now
stands, not the state it held when it was last drawn. A control whose value
came from a request that has since been superseded is stale for this row's
purposes even if it was fresh when it was fetched.

BEFORE THE ACTOR CAN ACT AGAIN is the binding half. A surface that catches up
eventually still lets one wrong act through, and one wrong act is what every
sighting above cost.

THE RULE APPLIES TO THE VALUES THE SURFACE IS HANDED, not only to its own
redraw. A host that draws its own bar from its own values owes the same
freshness, and the comment above records that a host doing so is exactly how
this drifted before.

## Behaviour

NO MODEL WANTED HERE. This is one condition and one response, and a diagram of
it would restate the statement in a second notation that can then drift from
it. The sequence that matters is already carried by
req-a-refused-act-says-why-and-what-next.
