---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a dead queue argument
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: queue
---

## detail

AskToStop in src/engine/pull.go reads the rung and nothing calls it.

It answers a Ruling when an actor holds work it could still do, and it answers nothing when the tree is unleashed. So it reads as a queue rule that unbinding switches off. It has no caller outside its own test.

Dead code that reads a flag is worse than dead code that does not. A reader counting what the rung changes finds it, believes it, and writes it down. That happened in September 2026: the owner was handed a table listing the queue arguing once at a stop as enforced when bound and off when unbound. It is enforced nowhere.

The same shape has now been met twice. NoGuardsAtAll read the rung and had no caller either, and god was reported as having no behaviour because of it.

## proposed action

Read what AskToStop was for and decide between two ends. Either the stop path calls it, and the queue does argue once when bound, or it goes. Do not leave it reading a flag while nothing runs it. Then look for the third one: a check that no function reading the rung is uncalled would have caught both of these.

## done when

- AskToStop either has a caller in the stop path or is deleted, decided by: se find --regex for AskToStop over src
- whichever end is chosen, the-three-rungs.md says what is true, decided by: reading the file against the code

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

