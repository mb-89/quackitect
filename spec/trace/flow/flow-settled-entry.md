---
minted_in: i62-background-work-reports-its-own-end-the-
id: flow-settled-entry
type: "[[flow]]"
statement: a piece of work marked finished, carrying its outcome and which of the two ways of noticing settled it
kind: material
crosses: out
source_refs:
  - req-a-run-closes-its-own-entry-when-its-process-exits
  - req-settling-an-entry-is-idempotent-and-the-first-outcome-stands
  - fn-run-a-governed-walk.keep-the-account-true
---

## What it holds

The outcome the work ended with, and how that outcome was learned: the work
said so itself, or the account noticed it was gone.

## Why the second half is part of the flow

The two are different facts about the same ending. A run that reported its own
exit gives an outcome nobody had to infer; one settled because it disappeared
gives an outcome that is a conclusion. A reader who cannot tell them apart
cannot weigh either.

## It is written exactly once

A second settle finds the entry already carrying this flow and produces
nothing. That is the whole of the idempotence demand, seen from the flow's
side.

## What it is not

It is not the account. `flow-work-account` is what a reader is told and it
covers everything at once; this is one entry's ending.
