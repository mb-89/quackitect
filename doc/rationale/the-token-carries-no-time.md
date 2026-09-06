---
kind: [[rationale]]
title: the token carries no time
explains:
  - src/engine/store.go
---

## decided

A token carries no time and no sequence.
The queue orders tokens by the number they were minted with, which is the file name.
Moves are timed in the record, which stays on the box.

## why

A token once carried seq, when it was typed, and the queue read it as what to do next.
When it was typed was an accident, and a queue that sorted on it read an accident as a decision.
The order somebody decided is depends_on.

Oldest first was still wanted, so that a queue hands out the thing that has waited longest.
The minted number said that.
A time would have said the same thing and also said when somebody was at their desk.
A tracked token travels, so a time on it travels too, into a record other people read.
The moves are still timed, in the record, because the record is the box's own and does not travel.

## costs

A token says nothing about when it was minted or closed, and a reader who wants that opens the record or git.
Two tokens minted on two boxes order by number, which says nothing about which came first.

## revisit when

- the record travels with the tree, so the time on it is public anyway
- tokens are minted from one counter across boxes, so the number is an order again
