---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: raid-asm-engine-serves-from-the-bound-tree
type: "[[raid]]"
kind: assumption
statement: A running engine can serve content from a store it does not itself live in, without losing the ground it stands on.
owner: the driving agent
trigger: at the first reload taken while a record is bound, once the lane root moves
status: open
probe: "Bind a record on a product that does NOT edit the engine, move the lane root, and take a reload. If the engine comes back serving the bound tree's content while running from trunk's sources, this holds. If the reload cannot resolve, the answer is the seed's other branch - an engine change stays invisible until the record lands, accepted rather than fixed."
probed: "not yet - it cannot be probed from this repository. The probe needs a product that does not edit the engine, and Quackitect is the only product here and the exception itself. Reasoning cannot settle it: both branches are consistent with everything known today."
impact: The whole binding rests on it. If the engine cannot serve from the bound tree, an engine change stays invisible until the record lands, and the iteration's own subject cannot be developed inside its own record.
breaks_how_badly: fatal
how_likely: plausible
source_refs:
  - note-2f2df7b39994
  - i27 record vision — the one question the seed leaves open
---

THE ASSUMPTION, stated plainly. While a record is bound, `project/...`
resolves into that record's worktree. The engine that resolves it is
JavaScript loaded from trunk's `deliverable/`. So the machine doing the
resolving lives outside the tree it is resolving into.

That is fine while nothing changes the engine. Quackitect changes the
engine constantly, which is why this product is the exception the seed
already names — it walks on trunk and gets no worktree at all.

WHAT IS ASSUMED RATHER THAN ESTABLISHED: that the exception is enough.
It rests on one claim — a product never works on Quackitect, so only
Quackitect works on itself. If that holds, no other product can ever
drift into the self-hosting case, and the binding is safe for all of
them.

WHY IT IS NOT YET PROVEN. Nobody has run a bound record whose lane root
IS the worktree, on any product. The exception is reasoned from the
ownership model, not observed. A vehicle that vendors its own method
extensions is the nearest thing to a counter-example, and whether a
vehicle editing its overlay counts as working on the engine is not
settled anywhere.

## Probe

Bind a record on a product that does NOT edit the engine, move the lane
root, and take a reload.

IF THE ENGINE COMES BACK serving the bound tree's content while running
from trunk's sources, the assumption holds and this closes.

IF THE RELOAD CANNOT RESOLVE, the answer is the seed's other branch: an
engine change stays invisible until the record lands, and that cost is
accepted rather than fixed.

THE PROBE IS CHEAP AND IT IS NOT OPTIONAL. It costs one bound record and
one reload, and it is the only observation that tells the two branches
apart. Reasoning cannot: both are consistent with everything known now.

## Falsification

A second product that edits Quackitect's
engine. The ownership model says that cannot happen. If it ever does,
the exception has more than one member and the reasoning behind it is
gone.
