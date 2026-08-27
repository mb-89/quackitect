---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: el-work-offer
type: "[[element]]"
statement: Answers what work a hand may take now, and how much a position still owes, without writing anything.
kind: new
realization: make
group: the-work
implements:
  - fn-run-a-governed-walk.offer-the-work-that-is-ready
  - fn-run-a-governed-walk.count-what-is-owed
source_refs:
  - cand-files-while-open-one-file-in-version-control-once-closed
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
  - opt-a-work-token-is-derived-when-it-is-asked-for-not-when-a-position-opens
  - opt-everything-is-ready-unless-an-order-was-written-down
  - raid-asm-minting-on-every-entry-stays-inside-the-per-hop-budget
---

THE HOT-PATH READS ARE HERE: what a hand may take now, and how much a position
still owes. Both happen on every look at a position, and putting them on the
write path would be a derivation on every entry into every position.

IT IS NOT "EVERY READ", and saying so would be wrong. The store answers two
reads itself — what a position has settled, which only the holder of the work
can report, and the standing position it must know before it writes.

THE CUT IS ON WRITES. This element writes nothing at all; the store writes
everything. That is the line, and it is sharper than a read-versus-write split
because it is true.

## What it does

OFFERS the work a hand may take now. Two filters, both from the work itself.

- A piece of work declaring a predecessor is withheld. The edge comes in two
  kinds and this element reads both: another piece of work reaching the outcome
  the edge names, or a whole POSITION finishing. A position has no outcome; it
  finishes when everything in it is settled or moved.
- A piece of work declaring no predecessor is offered at once, which is the
  ordinary case.
- A piece of work carries how hard it is, and a hand is offered only what its
  own strength covers.

COUNTS what a position still owes, per slot, and hands the figure to the
surface as a flow rather than letting the surface invent it.

## Why counting is not the surface's job

A WRONG COUNT DRAWN BEAUTIFULLY IS WORSE THAN A RIGHT COUNT DRAWN PLAINLY.
Making the count a flow this element produces means the surface consumes a
number rather than deriving one, and only one of the two can be wrong.

## Why it is separate from the store

THEY FAIL DIFFERENTLY. A wrong write loses work. A wrong read shows the wrong
number and loses nothing, and it is recoverable by asking again.

THE READ IS ON THE HOT PATH AND THE WRITE IS NOT. Every look at a position
counts; only entering one mints.

## What it leans on

THAT READINESS IS CHEAP TO DERIVE. Everything is ready unless an order was
written down, so the common case costs nothing and only a declared predecessor
costs a check.

THAT MINTING IS AFFORDABLE ON EVERY ENTRY. That assumption is now CLOSED and
measured: a real five-part card costs 18.52 ms whole and a re-entry costs
7.58 ms writing nothing ([[exp-what-one-mint-costs]]).

THE PER-HOP BOUND WAS THE WRONG COMPARISON and the entry says so. The 250 ms
binds the flip; minting is an entry duty on the unbounded side. What actually
binds is the signal, and at these figures there is nothing to signal about.
