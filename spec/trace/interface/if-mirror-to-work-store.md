---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: if-mirror-to-work-store
type: "[[interface]]"
statement: A person moving a row in the bucket editor names that move to the work store, which is the only element that may change where a piece of work sits.
source: el-mirror
destination: el-work-store
carries:
  - flow-work-item
form: one call per move, carrying the work and its new place
bound: the surface's own one-second bound
source_refs:
  - "owner clarification 2026-08-26: two editors, and the bucket editor is one we build"
  - req-the-work-editor-needs-no-new-instruction
  - raid-iss-no-element-implements-the-work-editor-the-requirement-is-about
---

A SURFACE THAT WRITES A PIECE OF WORK IS NEW. Every surface before this one drew
and did not write, so this crossing did not exist.

## What it carries

THE WORK BEING MOVED, and where it is going. A place is a position or the
backlog, and nothing else is one.

## What the surface never does

IT DOES NOT WRITE THE WORK ITSELF. Dragging a row is a request; the store
decides whether the move is legal and it is the only element that writes.

IT DOES NOT DECIDE READINESS. A move can put work somewhere its predecessor is
not yet satisfied, and the offer is what withholds it afterwards.

## Why it goes to the store rather than the offer

ONE WRITER IS WHAT MAKES THE MERGE SURFACE COUNTABLE, and that is what the
decision accepting the merge cost rests on. Letting a surface write would put a
second writer on the work and break the argument underneath the whole design.

## Failure behaviour

A REFUSED MOVE LEAVES THE ROW WHERE IT WAS, and the surface says why. A row that
snaps back with no reason is the failure this names: the person tried something,
the system refused, and the screen reported neither.

A MOVE THAT ARRIVES TWICE IS THE SAME MOVE. Placing work where it already sits
changes nothing and is not an error.
