---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-publish-the-difficulty-and-let-consumers-choose-their-own-hand
type: "[[option]]"
cluster: the-sizing
question: what the block publishes
statement: the block publishes the difficulty as a property of the work and stops there, so choosing a driver is one consumer of that number rather than the block's purpose
found_by: transform
source: SCAMPER Put to other use applied to cluster-the-sizing — ask who else wants this number as-is
---

## Mechanism

THE NUMBER HAS MORE THAN ONE CUSTOMER, and the design currently has one. A
per-state difficulty is what a cost estimate wants, what a schedule wants, what
a reviewer triaging fifty-three states wants — show me the hard ones — and what a
human deciding where to spend attention wants. Driver selection is the first
customer, not the only one.

SO THE BLOCK SHRINKS TO TWO FUNCTIONS. obtain-a-step-s-difficulty and
reduce-a-milestone-to-one-difficulty stay. resolve-a-difficulty-to-a-driver leaves
the block and becomes a thin adapter on the receiving side, and
publish-the-driver-outward publishes the difficulty instead.

WHAT THAT BUYS. The rung ladder and the model roster leave our tree entirely, and
with them raid-asm-one-model-list-serves-every-host-the-engine-supports and
raid-asm-the-model-ladder-is-a-total-order. A difficulty is a fact about our work;
a driver is a fact about somebody else's fleet, and we were asserting both.

AND IT MAKES THE SAFETY RULE CLEANER. req-the-machine-names-a-driver-and-starts-nothing
exists to keep the machine from spending money. A machine that names no driver at
all cannot be read as instructing a spawn, so the rule holds by construction
rather than by a check.

WHAT IT COSTS: it does not answer the question the record was opened for. Somebody
still has to map difficulty to a hand, and pushing that outward means it is done
by a receiver we do not control and cannot audit — which is precisely what
nbr-the-driver-that-performs-the-spawn says we cannot make act anyway.
