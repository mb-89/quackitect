---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-risk-a-ref-read-is-not-a-tree-read-and-the-read-back-rule-names-only-trees
type: "[[raid]]"
status: closed
kind: risk
statement: The rule proving a resolution by reading back names four kinds of tree, and the winner adds a fifth path that is not a tree at all.
grade: crippling
against:
  - req-a-resolution-is-proven-by-read-back
source_refs:
  - "gate-architecture cold review, 2026-08-26"
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
---

## CLOSED AS WORK, NOT AS A FINDING — 2026-08-26

TWO CLOSING PATHS ARE NAMED BELOW and both are ours. A rule that needs a fifth
case is a piece of work, not something out of our control.

NOTHING BELOW IS WITHDRAWN. It becomes a work token when work tokens exist.

## The hinge

THE FOLDED RECORD HAS NO TREE. Its folder left the working tree, and what
answers for it is a commit.

## What the row demands

IT NAMES FOUR PATH KINDS: method, record content, session state, and the files
at the repository root. For each, a write is proven by READING BACK FROM THAT
TREE and comparing.

THE WINNER ADDS A FIFTH. A closed record's content resolves through history
rather than through any tree, so there is nothing on disc to read back from.

## Why the first verdict was wrong

IT WAS RULED "addressed, unchanged by this structure". That reading is about
whether the four named kinds moved, and they did not.

WHAT MOVED IS THE SET. A rule listing every case it covers is falsified by a new
case, not by a change to an old one. The verdict answered the narrower question
and read as though it had answered the wider one.

## The tradeoff, named

WHAT IS BOUGHT: a closed record off the working tree, which is the whole archive
decision.

WHAT IS PAID: one resolution kind whose proof rule does not reach it, so a wrong
resolution there is not caught by the mechanism that catches the other four.

## What would close it

EITHER THE RULE GROWS A FIFTH KIND, proving a ref read by reading the same
content back at the same commit and comparing. That is the same shape as the
other four and costs one more case.

OR THE FOLD IS PROVEN AT WRITE TIME, comparing the folded file against the
folder before it is removed, so nothing later has to read back at all.

## The trigger

AT THE BUILD STEP THAT WRITES THE FOLD, and at any state that touches the
resolution seam.
