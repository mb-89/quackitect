---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: el-work-store
type: "[[element]]"
statement: Holds every piece of work as an editable file while its iteration is open, and is the only element that writes one.
kind: new
realization: make
group: the-work
implements:
  - fn-run-a-governed-walk.mint-what-a-state-owes
  - fn-run-a-governed-walk.place-work-where-it-will-be-done
  - fn-run-a-governed-walk.settle-a-piece-of-work
source_refs:
  - cand-files-while-open-one-file-in-version-control-once-closed
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
  - raid-dec-the-position-owns-its-work-and-the-merge-cost-is-accepted
  - opt-work-is-a-file-in-the-working-tree
  - opt-a-closed-iteration-leaves-trunk-as-one-file-read-back-from-version-control
---

Every act that WRITES a piece of work is here, and no other element writes one.

THE CUT IS ON WRITES, NOT ON READS, and saying it the other way overstates it.
This element serves two reads itself: the report of what a position has settled,
which only the holder of the work can answer, and the standing position it must
know before it can write at all.

WHAT MOVED TO THE OTHER ELEMENT IS THE HOT-PATH READ. Answering what is ready
and counting what is owed happen on every look at a position, so putting them
here would put a derivation on every entry into every position.

## What it does

MINTS what a state owes when the walk enters it, deriving the set from the
reading that state demands, from the marked steps of its method, and from the
evidence it must produce.

MATCHES a standing piece of work to its step by that step's own identity when a
state is entered again. A reworded method card creates no duplicate and orphans
nothing, because the match is on the stamped identity rather than on the
heading.

PLACES a piece of work on a position, which then owes it. The position cannot
be left until that work is settled or moved on again.

HOLDS THE PREDECESSOR EDGE, in both of its kinds. A piece of work may wait on
ANOTHER PIECE OF WORK reaching a named outcome, or on a WHOLE POSITION
finishing. The second is not the first repeated for every item in that position:
a position finishes when everything in it is settled or moved, and that is one
fact rather than a list.

WHY BOTH ARE HELD HERE. The edge is written on the work, so the element that
writes the work writes the edge. The offer reads it and withholds; it never
decides what an edge means.

SETTLES a piece of work at a terminal status. A close at anything other than
done is refused until a stated reason stands on the work.

MARKS ON ITS FACE what only a person may settle, so a hand reading the work sees
the limit before it starts rather than at the refusal.

DECLARES WHETHER A DRAWN VALUE IS A SNAPSHOT OR A LIVE READING. A figure copied
at settle time and a figure read on every look answer different questions, and a
settled piece of work that does not say which it holds cannot be audited later.

HANDS ITS WORK OVER AT CLOSE, to the element that owns closing and the archive.
The fold itself is NOT here, because closing a record is a record-level act and
this element holds work items.

## What it does not do

IT DOES NOT ANSWER WHAT IS READY, and it does not answer how much is owed.
Those are reads, they happen far more often than the writes, and putting them
here would put a derivation on every entry into every position.

IT DOES NOT DECIDE WHETHER A POSITION MAY BE LEFT. It reports what is settled
and what moved; the judgment is the walk's.

IT DOES NOT FOLD, ARCHIVE OR CLOSE. Those are the record store's, which already
implements closing a record and keeping the archive. Writing the fold here would
put a record-level act in an element that holds work items, and two elements
would then describe the same close.

## The seam that matters

THE HANDOVER AT CLOSE IS THE SEAM. This element stops owning the work and the
record store starts owning its folded shape. Getting the handover wrong loses
work rather than slowing it.

## What it costs, named rather than discovered

THE MERGE SURFACE IS ACCEPTED AND UNMEASURED. One file per piece of work means
two hands writing the same position can collide, and nothing has measured it
because one hand walks this system today. The decision that accepts it names
the fix if it fails.

FOURTEEN ENGINE FILES READ `spec/iterations` FROM DISC across 33 sites, and each
learns the folded file or the commit read.
