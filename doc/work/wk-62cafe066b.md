---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: depth counts unworkable tokens
# where the token stands. The process owns these values.
status: open
---

## detail

FOUND REVIEWING wk-8863048da6, which is not this token's parent because nothing here blocks it.

QueueDepth in src/engine/queuefilter.go is declared as the number the panel draws beside the filter box, and util/parameters.json calls it "how many tokens the queue would hand out". It is not that number.

It skips two things: t.Ended() and the private process. The queue skips more. src/engine/pull.go:475 skips a token held by somebody else, :483 skips one Blocked answers for, and :1312 skips one WaitsForAPerson answers for, which is every token carrying a ready_when.

Measured on this tree with no filter: se status says 214 open, of which 24 are parked and 25 are on a person. QueueDepth counts all of them.

WHAT IT COSTS. The whole point of the number is written in its own comment: a person filing into a bucket can watch it empty. A bucket holding one parked token never empties, so the person watches a number that will not reach zero and waits for something that has already happened. On a cloud box, which is what the filter was built for, that number is the only thing they can see.

## done when

- QueueDepth counts only what a pull would hand out, decided by: a Go test over a tree carrying one plain token, one parked with ready_when, one held by another actor and one blocked, asserting QueueDepth answers 1
- the same test reddens against QueueDepth as it stands, seen before the change

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

