---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: req-a-control-that-undoes-on-a-second-press-says-so-first
type: "[[requirement]]"
statement: Where a second act on a control undoes the effect of the first, the product shall say so on the control before that second act is possible.
kind: functional
verify_method: test
breaks_if_removed: Checking whether an act landed becomes the thing that unlands it, so the safest way to use the product is to never verify anything.
breaks_how_badly: crippling
priority: must
refines:
  - uc-act-on-a-control-and-know-what-it-did
source_refs:
  - sty-the-control-that-says-why-it-declined
  - req-a-surface-shows-the-state-an-act-produced
---

## Detail

THIS ROW EXISTS BECAUSE OF A REAL LOSS, not a hypothetical. The emergency rung
was armed, drawn in the wrong state, and the owner pressed it a second time to
check whether the first press had registered. That second press released the
rung and disarmed the engine.

WHY IT IS A SEPARATE ROW from req-a-surface-shows-the-state-an-act-produced.
That row stops the surface being stale. This one holds even when the surface
is perfectly fresh, because a cumulative control's second press is destructive
BY DESIGN and a person who has not read the design cannot know that.

THE TWO VERIFY DIFFERENTLY, which is the split rule this method names. Staleness
is caught by asserting the rendered value against the stored one. This is caught
by asserting that a destructive-on-repeat control carries its warning.

WHICH CONTROLS THIS COVERS. Any control where the same act twice does not equal
the act once. The rung banks are the known family: pressing a lit rung releases
it and everything above it, which is correct behaviour and is not obvious from
looking at a lit button.

WHAT SAYING SO REQUIRES. The control itself carries it, not a document and not
a tooltip nobody opens. The rung banks already carry a title attribute saying
"click: release this rung and every rung above it" — that is the right shape,
and the finding is that it was not enough when the rung was drawn in the wrong
state, which is the other row's job.

## Behaviour

NO MODEL WANTED HERE. One condition, one response. The state model that would
show it is the same one carried by req-a-refused-act-says-why-and-what-next,
and drawing a second copy invites the two to disagree.
