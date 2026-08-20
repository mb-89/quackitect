---
minted_in: i9
id: req-the-machine-state-sits-in-the-folder-that-is-open
type: "[[requirement]]"
statement: When the engine resolves a path, the product's root folder shall be the folder that is open, and shall resolve to that same folder whatever branch is checked out.
kind: functional
verify_method: test
breaks_if_removed: Nothing says WHICH folder is the product's root, so the standing rule that every product-owned artifact lives inside it can be satisfied by a root nobody is looking at. Switching branches can also switch which state a person sees.
breaks_how_badly: crippling
refines:
  - uc-install-quackitect
  - uc-arrive-on-an-unattended-machine
source_refs:
  - req-product-is-a-folder
  - uc-install-quackitect step 4
  - "sty-ramp-up slide 4: the editor opens on the project folder, and that folder is the product"
  - "i9 scope: the machine-state folder leads the move, because its home is the one the rule settles first"
  - raid-asm-the-branch-independence-ruling-constrains-branch-and-not-depth
priority: must
---

## What this row adds, and what it deliberately does not repeat

[[req-product-is-a-folder]] HAS STOOD SINCE i1 AND ALREADY CARRIES THE
CONTAINMENT DEMAND. Every artifact a product owns lives inside that product's
own root folder, with zero product-owned files outside it, and its own list
names the notes, the inbox, the evidence files and the logs.

SO CONTAINMENT IS NOT THIS ROW'S CLAIM. Restating it would give the register
two rows that fail together and mean the same thing.

WHAT WAS NEVER SAID is which folder that root IS. A rule about what lives
inside a root is satisfiable by any root at all, including one the person
never sees. This row fixes the referent.

## Detail

| claim | pass line |
| --- | --- |
| identity | the product's root folder is the folder the editor has open, with no level above it holding product-owned files |
| branch | with a record bound, that folder resolves to one place across a branch switch, and the state read before the switch is the state read after it |

THE BRANCH CLAIM IS THE OLDER ONE AND WAS NEVER CHECKED. It stands as a ruling
that session state belongs to the machine rather than to a branch. This row is
where it stops being trusted and starts being tested.

THE IDENTITY CLAIM IS THIS ITERATION'S, and the assumption underneath it is
carried openly and graded crippling: the branch ruling is read as constraining
which branch owns state and as saying nothing about depth. If that reading is
wrong, this row is what fails, loudly and in one place.

## They verify together and could not verify apart

ONE TEST BINDS A RECORD, READS THE STATE, SWITCHES BRANCH AND READS AGAIN. The
same test observes where the folder sat both times, so splitting this into two
rows would give two rows verified by one test, which is the shape the authoring
method says to fold rather than split.

## What the i1 row means for this iteration's case

THE COLLAPSE IS NOT A NEW DEMAND. It closes a standing one. Notes, the inbox
and the logs are product-owned by the i1 row's own list, and today they sit
outside the folder that row is about.

THAT WAS FOUND WHILE DERIVING FUNCTIONS, not while arguing for the change, and
it is worth more than the arguments that were made without it. A must-row
graded crippling has been unsatisfied since it was written.

## What this row does NOT say

IT NAMES NO MECHANISM. Whether the folder is found by being the root, by a
walk upward, or by something the editor hands over is the design milestone's
call.

THAT DISTINCTION EARNED ITS PLACE AT THE M2 GATE. The prior-art comparison
found that every command-line tool in the sample finds its root by walking up
to a marker, and that testing for the machine-state folder at the root IS a
marker check under another name. The design space is wider than this
iteration's own prose suggested, and this row leaves it open on purpose.

## Behaviour

No model wanted. It is one condition and one response, twice, and the Detail
table carries both.
