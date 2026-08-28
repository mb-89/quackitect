---
minted_in: i62-background-work-reports-its-own-end-the-
id: flow-wait-bound
type: "[[flow]]"
statement: how long a wait will wait before it stops waiting, and whether that figure was measured or defaulted
kind: signal
crosses: in
source_refs:
  - req-every-wait-declares-a-bound-and-expiry-acts
  - fn-run-a-governed-walk.bound-a-wait
---

## What it holds

One figure per wait, and one word saying where the figure came from.

## Why the provenance travels with the figure

A default and a measurement are acted on differently. A caller told a bound
was defaulted knows it says nothing about this work; a caller told it was
measured can plan against it.

This is the same rule the account already holds for a time remaining, applied
to the other end of the same problem.

## What it is not

It is not a time remaining. That says how much longer the work needs; this says
how much longer the waiting will go on, and the two disagree exactly when the
wait is about to end something.
