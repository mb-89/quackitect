---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-the-choosing-is-done-by-the-person-and-no-chooser-is-built
type: "[[option]]"
cluster: cluster-the-benchmark-run
question: how a run decides which iteration to walk
found_by: without
statement: The decision of what to work on is left to whoever asked for the work, so the system carries no selection logic at all.
source: TRIMMING — asked whether the choosing function can go, and the owner's ruling that a person triggers every run makes the answer nearly yes
---

## What goes

The draw by size, the seed that records the draw, and the flow that carries them.

## What survives, and it is small

Cycling. A run given no name still has to pick the least recently benchmarked
iteration, because a person naming one every time will drift toward whichever
one they remember.

## Why it is worth stating rather than dismissing

The owner already ruled that a person triggers every run. Once a person is in
the loop at the start, a size-draw with a recorded seed is machinery serving a
case that may never arise. The whole seed apparatus survives on one use.

## Mechanism

One read over the reports folder, returning the oldest. No seed, no draw, no
size argument.
