---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: sty-find-working-code-that-no-surface-can-reach
type: "[[story]]"
statement: When I want to know what this system can do, I want everything it exports to be reachable or deleted, so working code cannot sit behind no door at all.
actor: stk-newcomer
refines:
  - vp-the-engine
priority: must
---

## Deck

Two working pieces of code have tests proving they work, and no surface
exposes either. Nobody can ask them anything, and nobody knows they are there.
|||
STILL TRUE OF BOTH, and that is the honest answer rather than the comfortable
one. `drivenBy` in `deliverable/engine/produce.ts` reports which of three
conditions a folder is in. It is exercised by `produce.test.ts` and reachable
from no surface.

IT IS ALSO INVISIBLE TO THE CHECK BUILT TO FIND IT, for the reason the next
slide gives.

---

The guard that checks entry points can be reached walks a hand-written list
holding two of them. Everything else exported goes unchecked, which is how
those two came to be missing in the first place.
|||
THE LIST IS GONE. `deliverable/tests/help.test.ts` called a list of six; it now
calls `entryPoints(repoRoot)`, and the widening found 17 real pre-existing
findings across 11 files on its first run.

THE REPLACEMENT ENUMERATES RUNNABLE FILES, NOT EXPORTS. `entryPoints` reads the
`bin` folder. An exported function with no script cannot be named by it, which
is why the two pieces above are still unfound. The slide's "everything else
exported" is the promise; a reachability sweep over runnable files is what
shipped.

---

The reader runs the guard.
|||
PERFORMED, 2026-08-26, as the boot state's own exit script against the real
tree rather than a fixture. It read 3164 nodes in 1133 ms.

---

The guard sweeps every exported entry point rather than a list, and names
each one no surface reaches.
|||
PERFORMED AND OBSERVED, within the narrower set the slide above corrects. Four
runnable entry points are NAMED rather than counted:
`bin/brand.ts`, `bin/package.ts`, `bin/register-extension.ts` and
`bin/se-manual.ts`.

The check was sharpened twice during the build after each version was found
wrong — once for counting prose as an invocation, once for letting a file
certify itself with its own usage comment.

The report is
`spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/reports/rpt-sty-find-working-code-that-no-surface-can-reach.md`.

---

For each name the reader answers once: give it a door, or delete it and
record why.
|||
NOT DONE FOR ANY OF THE FOUR. They stand named and untouched, and the record
says so at both gates rather than implying otherwise.

Naming was this record's work. Answering is the next record's, and the goal's
own words asked for both.

---

Every export is reachable or gone, and the answer no longer depends on
somebody remembering to add a line to a list.
|||
THE SECOND HALF HOLDS. The answer comes from the tree on every run, and no list
is maintained by hand.

THE FIRST HALF DOES NOT. Nothing exported is reachable-or-gone yet: four
runnable files are unanswered, and every export that is not a runnable file is
outside what this check can see at all.
