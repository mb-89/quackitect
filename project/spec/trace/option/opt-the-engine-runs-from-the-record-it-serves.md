---
minted_in: i27
id: opt-the-engine-runs-from-the-record-it-serves
type: "[[option]]"
statement: load the engine's code from the record's own tree rather than from trunk, so an engine edit made inside a record is the code that record runs and no other record can see it
cluster: cluster-the-walk
question: how a change to the engine's own code takes effect
found_by: contradiction
source: raid-asm-engine-serves-from-the-bound-tree asks whether an engine loaded from trunk can serve a bound tree — turning the question round asks whether it should be loaded from the bound tree instead
---

## Mechanism

The engine stops being one shared program. Each record's tree carries the
engine version that record is developing, and whatever serves that record
runs THAT copy.

An edit inside a record is, by construction, only that record's engine. There
is no propagation step to design and nothing to drift, because nothing is
shared.

## What makes it different from the other answers

THE OTHER THREE ASK HOW A CHANGE TRAVELS. This one removes the travel by
making the code part of the record, the same way the record's spec is.

IT IS THE ONLY ANSWER THAT ALSO SETTLES raid-asm-engine-serves-from-the-
bound-tree, an assumption open since the milestone opened and recorded as
unprobeable from this repository. Here the question does not arise.

## What it costs

EVERY RECORD CARRIES A FULL ENGINE, which is the widest disk and the widest
levelling cost on the chart. Twenty-seven trees stood on this machine on
2026-08-13.

A RECORD OPENED MONTHS AGO RUNS MONTHS-OLD CODE, and its walk is judged by
rules that have since changed. That is either the point or the defect,
depending on the reading, and nothing here settles which.

BOOTSTRAPPING IS UNSOLVED. Something has to decide which engine serves a
record before any engine is serving it.

## What it buys

Perfect locality, at the price of perfect divergence.
