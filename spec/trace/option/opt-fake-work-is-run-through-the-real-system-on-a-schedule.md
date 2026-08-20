---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-fake-work-is-run-through-the-real-system-on-a-schedule
type: "[[option]]"
cluster: cluster-the-benchmark-run
question: how a run is triggered
found_by: prior-art
statement: "Scripted work is pushed through the live system at intervals, its output discarded and its timing kept, so a regression shows up before a person notices it."
source: "ref-agent-benchmark-harnesses-2026 \u2014 synthetic monitoring in application performance tooling; RECALLED rather than fetched"
---

## What it buys

Regression detection without anyone asking for it.

## What it sheds here

The fakeness. A synthetic transaction is invented because no real one can be
replayed. A finished iteration can be, which is what makes this project's
version cheaper than the tradition it comes from.

## The part not yet taken

Nothing in this iteration runs a benchmark on a SCHEDULE. Cycling decides WHICH
iteration runs; nothing decides WHEN. That is a live gap rather than a rejected
idea.

## Mechanism

A scripted transaction is pushed through the live system at fixed intervals by a scheduler. Its output is discarded on completion; its timing is appended to a series that a threshold watches.

## Ruled out by the owner, 2026-08-19

THE SCHEDULE HALF IS NOT TAKEN. The owner: "There does not need to be a
scheduler. The owner will tell you."

A benchmark run is triggered by a person, always. What survives from this
option is the rest of it — fake work through the real system, output
discarded, timing kept — which the whole iteration already rests on.

SO THE GAP THIS OPTION SURFACED IS CLOSED BY RULING rather than by a
requirement. Cycling decides WHICH iteration a run takes when none is named.
Nothing decides WHEN, and nothing should.
