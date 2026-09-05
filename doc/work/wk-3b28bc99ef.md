---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: bottleneck line overclaims
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - b5f82dc7fee838601ddc247dbc0ec2de6a536088
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 4c2e112a267cec078c8a2790d660343afbb8a400
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

noteHook in src/engine/hookserve.go says one line under one headline, whichever of three bounds tripped. The bounds are a queue of 4, a wait of 250 ms, and an answer of 500 ms.

The headline at line 151 always reads "the guard is the bottleneck". The owner read it saying 1 queued, waited 0 ms. Nobody waited on the guard, so nothing was behind it.

The comment at line 88 says the depth of the wait is the one number that says the engine is the bottleneck. The code then says it on the answer time too, which is a different fact.

A slow answer to a single hook is a slow hook. Other work piling up behind it is a bottleneck. The line names both as the first, and the headline is what a person reads.

## proposed action

Say what tripped. A deep queue or a long wait reads as the guard being the bottleneck. A long answer with nothing queued reads as a slow hook.

The three numbers stay on the line either way, so nothing is lost to a reader who wants them.

## done when

- a long answer with an empty queue is not called a bottleneck: a test drives noteHook with queued 1, waited 0 and took 600 ms and reads the line said
- a deep queue is still called a bottleneck: the same test drives noteHook with queued 5 and reads the line said
- every line still carries the queue depth, the wait and the answer time: both lines above are checked for all three numbers

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one function, one headline, one test | — |
| [x] | every done-when line is decidable, and names the command where one decides it | all three are one test driving noteHook twice | TestTheLoadLineSaysWhichBoundTripped |
| [x] | the basics it stands on exist, or are minted first | noteHook and its three bounds already exist | — |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | the detail names the smallest case, which is the line the owner read | — |
| [x] | one test was written first and seen red for the reason expected | it failed saying a slow answer with an empty queue is called a bottleneck | loadsays_test.go:65 |
| [x] | the same test was seen green after the change, and named | TestTheLoadLineSaysWhichBoundTripped ok, 0.183s | se_test |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | began b5f82dc7fee838601ddc247dbc0ec2de6a536088 | — |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | nothing else was revealed | — |

## evidence: what the checks said

The red reproduced the owner's own line, word for word: the guard is the bottleneck, 1 queued, waited 0 ms, answered in 600 ms.

The change reads the two halves apart. A queue at or past its bound, or a wait at or past its bound, is work piling up behind the guard. That keeps the word bottleneck.

A long answer with nobody behind it now says the guard was slow on one hook.

Both lines still carry all three numbers, and the test checks each line for queued, waited and answered in. The record also carries behind as a field, so a query can filter on it.

The bounds are untouched. What tripped is said differently, and when it trips is the same.

