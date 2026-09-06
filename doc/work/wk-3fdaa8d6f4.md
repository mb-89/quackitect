---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: blocked offers parked work
# where the token stands. The process owns these values.
status: open
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 621531d106f180de0e21deb1abc746b15d7e1a67
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 7cb5876c6f354bc49c6aca72eb6e639a377b5d1e
---

## detail

anOffer in src/engine/stopjudge.go counts what the queue would hand an actor, and it is not what the queue hands out. It walks Tokens(r) and skips four things: Ended, a holder, WorkableBy for the worker role, and Blocked. The pull skips more. It narrows through theQueueOffers, which is the filter in force, and asks WouldHandOut, which also passes over a token waiting on a person, one another box has claimed, and one the record will not write. Nothing about the hold reaches it either.

BlockedIsFalse reads anOffer, and decideStop reads BlockedIsFalse, so a blocked claim is judged against a queue nobody has.

Measured on this box, 2026-09-06, one call after the other. se pull answered "Nothing the engine hands out. 6 piece(s) wait for a person", and no new work goes out while the person has the queue on finishing. se stop --because blocked was then refused with "the queue would hand you wk-05df5b9967 Dead claim strands note, one of 174 standing". se status lists wk-05df5b9967 among the 27 that wait on a person.

WHAT IT COSTS. An agent whose queue is genuinely dry cannot claim blocked, because the engine says work is standing that it will not hand over. Its choices are a stop with no claim, which is refused, or a reason it does not believe. Both are the thing the claim was built to stop.

## proposed action

Let anOffer ask the pull's own question. Walk theQueueOffers rather than Tokens, and keep a token only where WouldHandOut says the queue would hand it to this actor as a worker. That is the same narrowing TheQueueWouldHandOut was given under wk-b417a9c58a, for the same reason: one answer to what is workable, and every door reads it.

## done when

- anOffer offers nothing a pull would not hand out, decided by: a Go test over a tree whose only token is parked with ready_when, asserting BlockedIsFalse answers false for an actor holding nothing
- the same test reddens against anOffer as it stands, which offers the parked token
- the refusal still names a real offer, decided by the same test adding one ordinary token and asserting BlockedIsFalse answers true and names it

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

