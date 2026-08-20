---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-one-model-list-is-read-live-from-the-repository
type: "[[requirement]]"
statement: "The mapping from a complexity rung to a model shall be one file in the repository, read live at the moment of lookup, with no runtime discovery and no per-host roster."
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

## Detail

THE PATTERN IS ALREADY IN THE TREE, twice. `machines/scale.md` holds the
autonomy rungs and `machines/stopat.md` holds the stop notches; both state at
the top that the engine READS the file, both are edited by hand, and both put
the meaning in the order of the lines rather than in numbers on the page.

THE LIST IS THE THIRD OF EXACTLY THAT KIND and needs no new mechanism.

WHAT IT MUST NOT DO is ask the host anything. Explicitly ruled: no capability
probe, no roster, no discovery.
