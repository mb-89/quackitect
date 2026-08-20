---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-two-overlays-one-shared-one-personal
type: "[[option]]"
cluster: the-bootstrap
question: where a copy's own layer lives
statement: the copy's own layer is two layers, one committed and shared by everybody who clones it, one machine-local and never committed, resolved in that order
found_by: transform
source: SIT pattern MULTIPLICATION, applied to the overlay — copy the component and change the copy. Shipped by BMAD-METHOD, which splits its overrides into a committed team file and a gitignored personal one
---

## Mechanism

TAKE THE OVERLAY AND MAKE A SECOND ONE THAT DIFFERS IN EXACTLY ONE PROPERTY:
whether it is committed.

- THE SHARED LAYER travels with the copy. Everybody who clones gets it, and it
  is the copy's own product decision.
- THE PERSONAL LAYER never leaves the machine. It is one person's preference,
  and it wins over the shared one.

BMAD-METHOD SHIPS EXACTLY THIS. Team overrides go in a committed file and
personal ones in a gitignored sibling, merged at load, and its documentation
draws the same line: the installed files are regenerated on every install and
direct edits are overwritten, while the override folder is never touched.

## What it buys

IT SEPARATES TWO THINGS THAT ARE CURRENTLY ONE. A copy's overlay today would
have to hold both a product decision and somebody's habit, and those have
different audiences, different lifetimes and different correctness.

AND IT MAKES THE UPDATE QUESTION SMALLER. Only the shared layer is anybody
else's business. A personal layer cannot conflict with an upstream change in any
way a second person needs to hear about.

IT ALSO GIVES THE DRIFT REPORT A HONEST BOUNDARY. What the copy CHANGED is the
shared layer. What one person prefers is not a change to the product and should
not appear in a report about it.

## What it costs

A THIRD LAYER IN THE RESOLUTION ORDER, and every layer is a thing somebody has
to hold in their head to predict an answer. The predecessor already ran three
and this would make four.

AND THE MACHINE-LOCAL HALF REINTRODUCES A PROBLEM THIS ITERATION SPENT EFFORT
REMOVING. A personal layer does not travel, so a person who moves machines loses
it silently — the same failure the pointer question rejected a machine-local
store for.

THE DIFFERENCE, AND IT IS WHY THIS IS STILL WORTH A CELL: losing a preference is
an inconvenience, and losing the answer to which copy drives a tree is a broken
system. The isolation rule's concern is what a copy DEPENDS ON, and nothing
depends on a preference.

## The question it forces

WHETHER A COPY HAS PEOPLE, PLURAL. Everything else on this cell assumes one
owner. This option only pays where a copy is cloned by colleagues who each want
something slightly different, which the owner has said is the case — machines
that carry only the copy and never its source.

SO IT IS CHEAP TO DEFER AND EXPENSIVE TO RETROFIT. A single-layer design that
later needs two has to decide, for every existing override, which layer it
belonged to all along.
