---
minted_in: i51-work-running-out-of-sight-reports-itself
id: flow-work-under-way
type: "[[flow]]"
statement: every piece of work the session has started and not yet finished, whatever kind it is
kind: material
source_refs:
  - req-one-call-reports-every-piece-of-work-out-of-sight
  - fn-run-a-governed-walk.account-for-work-out-of-sight
---

## What it holds

One entry per piece of work the session started, from the moment it starts
until its outcome has been read.

An entry knows what kind of work it is, whether it is still going, and whatever
that kind of work has recorded about its own progress.

## Why it is one flow and not one per kind

Today two kinds exist and they are held apart. That separation is the defect
this iteration ends, and modelling it as two flows would carry the defect into
the design.

A kind added later joins this flow. Nothing about the flow names which kinds
exist.

## What it is not

It is not the outcome. `flow-battery-verdict` is what one kind of work hands
back when it ends, and it is consumed once.

It is not the account either. `flow-work-account` is what a reader is told, and
it carries durations this flow does not.
