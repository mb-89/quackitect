---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-an-override-is-recut-rather-than-maintained
type: "[[option]]"
statement: an override is treated as disposable rather than durable, cheap to regenerate against the current upstream, and re-cut on every update instead of nursed across them
cluster: the-bootstrap
question: how a stale override is caught
found_by: contradiction
source: TRIZ contradiction matrix cell 37 against 27, principle 27 Cheap short-lived object — vendored grid at deliverable/vendor/triz/triz-matrix.json
---

## Mechanism

THE OVERRIDE IS NOT AN ASSET TO PRESERVE. Each update regenerates it against
the upstream that has just arrived, and the machinery is built so that
regenerating is cheap rather than so that surviving is likely.

WHERE IT CAME FROM. The contradiction was that keying an override on the
target's identity makes it survive the target MOVING and makes it die silently
when the target is RENAMED. Improving reliability, degrading the difficulty of
detecting. The grid answers with four principles and only one transfers to
software: many disposable instead of one durable.

WHAT THAT INVERTS. Every other option on this cell tries to make a single
override robust — pin what it was cut against, key it on identity, let it call
through. This says a long-lived override is the wrong artifact, and that the
work goes into the regeneration instead.

TWO SHIPPED SYSTEMS ALREADY DO IT. Debian's source format demands patches
apply with ZERO fuzz and errors out otherwise, which forces a re-cut rather
than allowing a patch to limp. patch-package's own documentation warns that
long-lived patches are costly to maintain where the code beneath them moves.

WHAT IT BUYS. Silent staleness cannot accumulate, because nothing is carried
across an update unexamined. The failure mode that has no detector in any
system surveyed simply has nowhere to live.

WHAT IT COSTS, AND IT IS PAID BY A PERSON EVERY TIME. Somebody re-cuts. The
cost is proportional to how many overrides there are and how fast upstream
moves, and it is paid whether or not the upstream change touched anything that
mattered.

SO IT IS THE OPPOSITE TRADE FROM
[[opt-an-override-pins-what-it-was-cut-against]]. That one raises a question
whenever upstream moves. This one does the work whenever upstream moves.
Neither is free, and the choice is between a review cost and a rewrite cost.

AND IT WANTS THE OVERRIDE TO BE SMALL, or the trade collapses. Re-cutting a
whole forked document every update is not cheap. Re-cutting a named delta is.
That makes this option depend on
[[opt-the-override-calls-through-to-what-it-replaced]] or
[[opt-the-override-merges-into-what-it-changes]] rather than competing with
them.
