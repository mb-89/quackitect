---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-risk-work-taken-by-a-hand-that-dies-has-no-path-back
type: "[[raid]]"
status: closed
kind: risk
statement: A hand takes a piece of work and its session dies, and nothing in the structure releases what it took.
grade: crippling
against:
  - req-crash-lands-safe
source_refs:
  - evaluate-architecture, the ATAM walk
  - if-work-offer-to-work-store
  - el-work-store
---

## CLOSED AS WORK, NOT AS A FINDING — 2026-08-26

THE OWNER'S TEST: is it something we can just DO? Then it is a work item and it
does not belong in this register.

A RISK IS SOMETHING OUT OF OUR CONTROL. This is a design hole with a known fix,
so it was never a risk. It is a piece of work with a name.

NOTHING BELOW IS WITHDRAWN. The finding is real and the content stands; only its
HOME was wrong. It becomes a work token when work tokens exist.

## The hinge

THE TAKE IS THE HINGE. The offer hands a piece of work out, the store records
who took it, and the only other write is the settle.

TWO WRITES, AND THE STRUCTURE HAS NO THIRD. Nothing in it turns a take back
into an offer.

## What the row demands

THE ROW DEMANDS ONE END STATE across every kind of break: a crash, a reclaimed
machine, a dropped connection, a person's interrupt, a timeout.

TAKEN WORK ENDS IN NONE OF THEM. It stays taken by a hand that is gone, and the
next offer will not show it.

## The tradeoff, named

WHAT IS BOUGHT: every write to a piece of work lives in one element, which is
what makes the merge surface countable.

WHAT IS PAID: work can strand, and only a person notices.

## What would close it

A THIRD PATH, and it is not designed here because designing it is the build's
job rather than the evaluation's. Two shapes are obvious and neither is chosen
yet.

- A TAKE THAT EXPIRES. The store releases work whose taker has been silent past
  a bound.
- A TAKE THAT IS NEVER RECORDED. The offer shows everything and the settle is
  the only write, so nothing can strand.

## The trigger

IT FIRES ON THE FIRST STRANDED PIECE OF WORK, and on any build step that writes
the take path.
