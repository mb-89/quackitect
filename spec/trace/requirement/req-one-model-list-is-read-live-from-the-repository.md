---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-one-model-list-is-read-live-from-the-repository
type: "[[requirement]]"
statement: The engine shall publish the same statement of how strong a hand a step needs on every supported host for the same inputs, discovering nothing about it at run time.
kind: constraint
verify_method: inspection
breaks_if_removed: A system that answers differently on one machine than another cannot be replayed, and a walk that cannot be replayed is worth less here than one that is occasionally over-driven.
breaks_how_badly: corrosive
refines:
  - uc-let-the-machine-name-the-driver
source_refs:
  - uc-let-the-machine-name-the-driver step 4
  - raid-asm-one-model-list-serves-every-host-the-engine-supports
priority: must
---


## Restated at gate-architecture, 2026-08-20

THIS ROW NAMED A FILE LAYOUT. "One file in the repository" is not a demand, it is
a place to put something, and it excluded by construction every design that holds
no roster at all — including the one that scored highest on surviving a host swap.

WHAT IT MEANS, taken from its own breaks_if_removed: a system that answers
differently on one machine than another cannot be replayed. The demand is
determinism across hosts, and it is about what WE publish. A held roster read live
satisfies it. So does publishing a rung and holding nothing, because a rung is the
same on every host by construction.

WHAT THE RESTATEMENT GIVES UP, and it should be said: the old row also demanded
that the resolution to a concrete model be ours. That was the mechanism, not the
need, and under an architecture that publishes a rung the resolution is somebody
else's and cannot be constrained by us at all.

## Detail

WHAT THIS SECTION USED TO ARGUE, AND WHY IT IS GONE. It said the pattern is
already in the tree twice — `machines/scale.md` and `machines/stopat.md`, both
read by the engine, both hand-edited — and that "THE LIST IS THE THIRD OF
EXACTLY THAT KIND".

THAT PRESUMES A HELD LIST, AND THE STATEMENT ABOVE NO LONGER DEMANDS ONE. A
reader taking this Detail rather than the statement requires a roster and
mis-scores the two lines that hold none. Corrected 2026-08-20, by the fourth
cold pass over this register, which found it the same day and in the same shape
as the sizing must's Detail — one caught, one missed.

WHAT IS ACTUALLY DEMANDED is that our answer about how strong a hand a step
needs be the same on every supported host for the same inputs.

TWO SHAPES SATISFY IT AND THE TREE ALREADY RUNS ONE OF THEM. A held file read
live, in the manner of `machines/scale.md` — that pattern is real and it is
available, and it is now an EXAMPLE rather than the demand. Or publishing a rung
and holding nothing, because a rung is the same on every host by construction.

WHAT NEITHER SHAPE MAY DO is ask the host anything. No capability probe, no
discovery at run time. That clause survived the restatement because it is the
demand rather than a mechanism: a value discovered from the host is a value that
differs by host.
