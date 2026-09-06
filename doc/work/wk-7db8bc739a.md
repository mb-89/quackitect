---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: two tests cite challenge.go
# where the token stands. The process owns these values.
status: open
---

## detail

A finding on wk-dffbf05720, relenting needs a claim.

src/engine/relentneedsaclaim_test.go:82-83 sends a reader somewhere that is gone:

  // nothing is in this agent's hands and the engine has nothing to argue with.
  // See challenge.go.

src/engine/challenge.go was deleted, and se find over src/engine/challenge*.go answers with challenge_test.go alone. The argument it held went with it, so the sentence above the pointer describes a mechanism the tree no longer has, and the pointer names a file the tree no longer has.

This is the one place a reader goes to learn why a claim with empty hands is granted. What they find is a dead name. The rest of the test comment is good, which is what makes the dead line worth taking out rather than leaving beside it.

The same pointer is at src/engine/stop_test.go:158, and that one is not this token's.

## proposed action

Replace the pointer at src/engine/relentneedsaclaim_test.go:83 with what the claim path now does, and drop the sentence about having nothing to argue with. Do the same at src/engine/stop_test.go:158. No code changes.

## done when

- no file under src/engine cites challenge.go, decided by: se find --regex 'challenge\.go' over src answering no hits
- the sentence at src/engine/relentneedsaclaim_test.go:82 says what grants a claim with empty hands, decided by: reading it against the claim path in decideStop
- the two tests still pass, decided by: se test naming TestAClaimGrantsOneStopAndThePullSpendsIt and TestAStopClaimPassesEveryGuard

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

