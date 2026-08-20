---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-walk-a-sampled-step-twice-on-two-rungs-and-compare
type: "[[option]]"
cluster: the-sizing
question: how the decision is checked
statement: "a sampled step is walked twice on two different rungs and the two results compared, so the claim that the rung matters is measured rather than assumed"
found_by: transform
source: "SIT Multiplication applied to cluster-the-sizing — copy the walk and change the copy's hand"
---

## Mechanism

THE WHOLE LADDER RESTS ON AN UNMEASURED CLAIM: that a weaker hand does worse work
on a harder step. Nothing in this record tests it, and every option on the chart
is a way of acting on it.

MULTIPLY THE WALK, NOT THE MACHINERY. Pick a small fraction of steps. Walk each
one twice, once at the named rung and once a rung below. Compare the two signed
forms. Where they agree, the named rung was not needed for that step; where they
diverge, the ladder earned its keep there.

IT IS THE NEGATIVE CONTROL THE REST OF THE DESIGN LACKS. Every other check here
asks whether a rule was followed. This asks whether the rule is worth following,
and it is the only option on the chart that can return the answer no.

IT ALSO CATCHES SOMETHING ELSE, WHICH IS WHY IT IS CHEAP. Two independent walks of
one step disagree loudly when one of them invented something, because a fabricated
count and an honest count almost never match. A design meant to measure the rung
turns out to be a fabrication detector, and this record has already needed one.

IT IS WHAT req-a-machine-decision-repeats WOULD BE CHECKED BY. That requirement
says a machine decision made twice on the same input gives the same answer. Two
walks of one step is that requirement's experiment, run against the walk rather
than against the mapping.

WHAT IT COSTS: double the money on the sampled fraction, and a comparison nobody
has defined — two signed forms are never byte-identical, so what counts as
agreement is a design decision on its own. Sampling rate and comparison rule both
have to be named before this is a mechanism rather than an intention.
