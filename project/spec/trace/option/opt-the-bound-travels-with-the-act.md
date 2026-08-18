---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-bound-travels-with-the-act
type: "[[option]]"
statement: the write jail bounds every act to a tree, and which tree is a property of the act rather than a constant, so producing a new tree is bounded by the tree it is producing
cluster: the-bootstrap
question: what bounds an act that writes the tree it is producing
found_by: contradiction
source: "TRIZ separation IN SPACE, against the contradiction that refusing every write outside the tree in hand makes producing a new tree impossible — raid-iss-the-path-jail-has-one-write-target"
---

## Mechanism

THE RULE DOES NOT CHANGE. Every act writes inside one tree and nowhere else,
and a write outside it is refused at a single resolver.

WHAT CHANGES IS WHICH TREE, and that it is asked rather than assumed. Today the
jail names one constant, the project root. Under this option the jail asks the
act in progress which tree bounds it, and refuses everything outside THAT.

- An ordinary call during a walk is bounded by the tree being walked. No
  change.
- Producing a copy is bounded by the copy being produced.
- Producing a driven project is bounded by the tree being produced.

THE CONTRADICTION IT DISSOLVES. Refusing every write outside the tree in hand
prevents the system damaging a neighbour, and prevents it producing anything.
Both demands were assumed to name the same tree, and they never did.

SEPARATION IN SPACE, which is the cheapest of the four and needed no matrix
lookup. Both demands hold in full, in different places.

WHAT IT BUYS. The isolation guarantee gets stronger rather than weaker. A
producing act currently has no bound at all in the design, because the jail
cannot express one — so widening the jail to admit production without this
would mean an unbounded write. This gives production a bound it does not have.

AND IT IS ALREADY HALF WRITTEN. [[req-an-act-writes-only-the-tree-it-produced]]
states the rule for the producing side and carries a refuse-rather-than-half-do
facet. What was missing is the mechanism that lets the jail hold two different
bounds without holding two different rules.

WHAT IT COSTS, AND IT IS THE COST THAT MATTERS. The bound stops being a
constant and becomes state. A constant cannot be wrong. State can be stale,
unset, or set by the wrong caller, and each of those is a write landing
somewhere nobody chose.

SO IT DEMANDS THAT THE BOUND BE ESTABLISHED BY THE ACT ITSELF and torn down
with it, never set as a mode somebody can leave switched on. An act that opens
a bound and fails must leave nothing bound behind.

AND IT WANTS A REFUSAL THAT NAMES BOTH TREES. A write refused because it landed
outside its act's bound is a different error from one refused because it left
the project, and telling them apart is what makes the mechanism debuggable.

## What this does not answer

WHETHER THE PRODUCED TREE MAY EXIST BEFORE THE ACT. This product's own export
refuses a destination that is not empty, which sidesteps the question. An act
bounded by a tree that already holds somebody else's work is a different and
harder problem, and nothing here settles it.
