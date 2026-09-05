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
claimed_by: aeaf7bd9/worker-berio-three
claimed_at: "2026-09-05T21:03:02Z"
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
| [x] | what is gained by doing it, and not only what it does | An agent holding nothing stops on the claim that names its reason, instead of arguing twice. | decideStop |
| [x] | what breaks if it is never done, and not only that it stays undone | The hands condition could be deleted and every suite would stay green. | hook.go |
| [x] | the ask is small enough to review whole, or it is split first | One test file. The engine already reads the hands, since 91c3b1f9. | git show --stat |
| [x] | every done-when line is decidable, and names the command where one decides it | go test -run TestEmptyHandsAreNotArguedWith, and the Claim, Stop and Challenge selection. | go test |
| [x] | the basics it stands on exist, or are minted first | TheyHold, decideStop, ClaimStop and forgetRefusedStops are all here. | hook.go |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read whole. Rule 12 drove the red, rule 13 named the untested half. | work-token.md |
| [x] | one test was written first and seen red for the reason expected | With the hands condition out of decideStop, broken, decision and plan were each argued with by an actor holding nothing. | /tmp/stopredgreen.log |
| [x] | the same test was seen green after the change, and named | TestEmptyHandsAreNotArguedWith passed with the condition back. TestPublishKeepsEarlierClaims fails on the bare base too. | /tmp/stop-base.log |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | began ce8ee7f6 is no object here. One new test file, and no engine line. | git show --stat |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | wk-7c60f9f2ac. Criterion two wants asked argued with, and a ruling grants it at once. | wk-7c60f9f2ac |

