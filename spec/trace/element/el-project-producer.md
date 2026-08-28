---
unreachable_refs:
  - cand-the-program-route
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: el-project-producer
type: "[[element]]"
statement: Produces a tree for work that is not the system's own, and records in it which copy drives it and at what version, never where that copy sits.
kind: new
realization: make
group: the-bootstrap
implements:
  - fn-run-a-governed-walk.bring-forth-a-project
satisfies:
  - req-the-system-runs-in-a-tree-that-is-not-its-own
source_refs:
  - opt-the-tree-names-what-not-where
  - opt-the-bound-travels-with-the-act
  - raid-dec-a-driven-tree-names-which-copy-drives-it
  - raid-dec-a-producing-act-is-bounded-by-the-tree-it-produces
  - cand-the-program-route
---

## What it does

IT MAKES A TREE THAT CARRIES NO METHOD AND ONE RECORD THAT SAYS WHOSE IT IS.
The record names an IDENTITY and a VERSION. It names no path, so there is
nothing local to go stale when either tree moves.

THAT RECORD IS THE WHOLE POINT OF THE ELEMENT. Everything else it does is
scaffolding a folder; the demand it answers is that the system can later come up
in that tree and know which copy's method to serve.

## Why it carries a `satisfies` rather than tracing through its function alone

[[req-the-system-runs-in-a-tree-that-is-not-its-own]] IS PRIORITY MUST AND ITS
FOURTH FACET IS ABOUT ABSENCE: a tree with no such record is not a driven
project, and the system says so rather than guessing.

THAT FACET IS A PROPERTY OF WHAT THIS ELEMENT WRITES, not of what any function
consumes. A reader following the function chain reaches the resolution seam and
learns how a record is READ. Only this element decides that a record exists to
be absent, which is what makes refusal possible at all.

## The three states it makes distinguishable

WRITING THE RECORD IS WHAT CREATES THE DISTINCTION the seam later enforces.

- A tree this element produced: the record is present.
- A tree it never touched: no record, so not a driven project, and the system
  refuses naming what it looked for.
- A record naming a copy the machine has never seen: present but unresolvable,
  and the system refuses naming the identity.

WITHOUT THIS ELEMENT THERE ARE ONLY TWO STATES and the system can only guess.
That is exactly why three of the four candidates failed the demand.

## What crosses its boundary

IN: `flow-intent` and `flow-repository`, both crossing the system edge.

OUT: `flow-driven-tree`, consumed by `fn-run-a-governed-walk.resolve-a-path` on
[[el-resolution-seam]]. That is a boundary crossing and it owes an interface:
[[if-project-producer-to-resolution-seam]].

OUT: `flow-scaffolded-product`, which crosses OUT and is consumed by nothing.
The produced tree belongs to somebody else's work.

AND THE CROSSING CLAIM ON `flow-driven-tree` WAS WRONG UNTIL THIS ELEMENT
EXISTED. The flow carried `crosses: in`, which was honest while nothing inside
the system produced it and is not honest now.

## How it is reached

`se_produce_project`, a lane verb, beside `se_produce_vehicle`. Both acts share
one mechanism and differ only in the last file they write, so they are reached
the same way.

## The realization concept

MAKE, AND MOST OF THE COST IS THE IDENTITY RATHER THAN THE TREE. Scaffolding a
folder is small. What a copy's identity IS has not been decided — a copy today
is a folder with a name, and two people could produce copies with the same name
— and this element cannot be built until that is settled.

THE PRODUCING ACT IS BOUNDED BY THE TREE IT PRODUCES, checked at the resolution
seam rather than by guards written here.
