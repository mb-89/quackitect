---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-one-model-list-is-read-live-from-the-repository
type: "[[requirement]]"
statement: "Whatever the engine publishes about how strong a hand a step needs shall be the same on every supported host for the same inputs, with nothing about it discovered at run time."
kind: constraint
verify_method: inspection
breaks_if_removed: "A system that answers differently on one machine than another cannot be replayed, and a walk that cannot be replayed is worth less here than one that is occasionally over-driven."
breaks_how_badly: corrosive
refines:
  - uc-let-the-machine-name-the-driver
source_refs:
  - "uc-let-the-machine-name-the-driver step 4"
  - "raid-asm-one-model-list-serves-every-host-the-engine-supports"
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

THE PATTERN IS ALREADY IN THE TREE, twice. `machines/scale.md` holds the
autonomy rungs and `machines/stopat.md` holds the stop notches; both state at
the top that the engine READS the file, both are edited by hand, and both put
the meaning in the order of the lines rather than in numbers on the page.

THE LIST IS THE THIRD OF EXACTLY THAT KIND and needs no new mechanism.

WHAT IT MUST NOT DO is ask the host anything. Explicitly ruled: no capability
probe, no roster, no discovery.
