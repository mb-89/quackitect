---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: argue only when blocking
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-relay-trial
claimed_at: "2026-09-05T19:08:47Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ce8ee7f6c9e54efa531683e051d78c819abc1ed7
---

## detail

decideStop argues with every claim three times, whatever the state of the tree. The owner's rule is narrower: a good reason with nothing blocking is granted on the first claim, and the argument happens only when the engine has something to push back with, which is work in the agent's hands.

## proposed action

In decideStop read held := TheyHold(roots, actor) before the count, and run countRefusedStop and TheChallenge only when len(held) > 0.

## done when

- A standing claim of asked, made by an actor holding no token, is granted at the first Stop event with no output.
- A standing claim of asked, made by an actor holding one token, is refused at the first two Stop events and granted at the third.
- go test ./src/engine -run 'Claim|Stop|Challenge' passes.

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
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

