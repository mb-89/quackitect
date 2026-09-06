---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: four tests, one rule
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
---

## detail

FOUND REVIEWING wk-8863048da6, which deleted the argument over a claim.

FIVE TESTS NOW ASSERT ONE RULE. They were distinct because asked was carved out of an argument the others met. With the argument gone there is no carve-out, and the token's own new comment at src/engine/askedisgranted_test.go:47 says "there is no carve-out left to prove". It kept the test anyway.

avalidclaimstops_test.go:21 drives four reasons with work in hand. askedisgranted_test.go:44 and challenge_test.go:78 each drive asked with work in hand, which that loop already covers. challenge_test.go:24 drives broken with empty hands, which emptyhandsarenotarguedwith_test.go:26 already covers for all four.

AND TWO TEACH THE DELETED RULE AS CURRENT. challenge_test.go:71 and :84 say the engine tests every other reason "by pushing back twice", and emptyhandsarenotarguedwith_test.go:11 and :44 say the other three "are argued with only over open work". A reader of the suite learns the engine still argues.

THE FILE IS NAMED FOR A DELETED FILE. challenge.go went; challenge_test.go stayed.

THE CHECK is the token's own criterion widened: se find --regex for argued over src rather than doc/guidance alone.

## proposed action

Fold the three subset tests into the two that hold the rule, and delete challenge_test.go.

## approach

Keep TestAValidClaimStopsAtOnce for the rule over open work and TestEmptyHandsAreNotArguedWith for empty hands, both headers rewritten in the past tense. Delete TestAskedIsGrantedOnTheFirstClaim, TestThePersonsWordIsNotArguedWith and TestAClaimWithEmptyHandsIsGrantedAtOnce. Move TestTheRefusalAsksBeforeItLists beside the other refusal tests and delete challenge_test.go, which is named for a file that no longer exists.

## done when

- challenge_test.go is gone and no test file is named for a file not in the tree, decided by: se find --path src/engine/challenge*
- no test comment says the engine argues, decided by: se find --regex for argues|argued with|pushing back over src/**
- one test holds the rule over open work and one with empty hands, and both pass, decided by: se test proposing TestAValidClaimStopsAtOnce and TestEmptyHandsAreNotArguedWith
- the suite still builds and the stop battery is green, decided by: se test on this token

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

