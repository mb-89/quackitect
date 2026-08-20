---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-the-driver-reads-the-difficulty-and-decides-whether-to-take-it
type: "[[option]]"
cluster: the-sizing
question: who resolves a rung to a worker
statement: "the block states the difficulty and the driver decides whether to accept the work or hand it back, so the match is made by the side that knows its own capability"
found_by: transform
source: "SCAMPER Reverse applied to cluster-the-sizing — invert which side of the handover decides"
---

## Mechanism

WE ARE ASSERTING SOMETHING WE CANNOT KNOW. Naming a rung means claiming which
models can do this work, and that claim ages every time a vendor ships. The side
that knows what a model can do is the model's own host, not our tree.

REVERSE THE DIRECTION. The work carries its difficulty. A driver reads it and
either takes it or refuses with a reason. Nothing in our tree holds a roster, and
a driver that has become stronger or weaker changes its own answer without us
editing anything.

THE PRIOR ART IS BIDIRECTIONAL AND OURS IS NOT. Nix's requiredSystemFeatures is
the closest structural match found at find_prior_art, and its distinguishing
property is exactly this: a builder advertises what it supports and refuses work
it does not, so the scheduler's declaration and the worker's capability are
checked against each other rather than one dictating.

IT MAKES THE ASYMMETRY ENFORCEABLE. raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it
is about a rule with no mechanism: a weaker driver than named owes a reason, and
nothing collects it. Under a refusal protocol the reason is the refusal — it is
produced by the mechanism rather than requested from a participant who has no
incentive to write it.

WHAT IT COSTS: a round trip and a protocol, where the incumbent has neither. It
also needs a driver willing to refuse, and today's receiver reads and cannot act
at all — so this option is the furthest of any from something we can ship alone.
