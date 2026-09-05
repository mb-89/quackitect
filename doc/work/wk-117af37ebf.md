---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: take can fail silently
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-nono
claimed_at: "2026-09-05T14:51:57Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 3987b7c3e4c13204cbcd7748d8444ad2a515bfb7
---

## detail

A finding on wk-239cae9216, "a claim gates tracked".

src/engine/claimverb.go:106 runs the take-up only when the take flag is set, release is off and exactly one id was taken. Two things go quiet there.

When TakeUp fails, line 108 writes the reason into res.Notice and runClaim still answers 0. A caller that reads the exit code is told the claim-and-take worked while it holds nothing, and the next write is refused for holding no token.

When more than one id is named with take, the whole block is skipped and nothing anywhere says the flag did nothing. The flag was accepted and ignored.

The check that catches the class: a test that a refused take-up answers non-zero, and a second that take with two ids says the flag was not applied. TestAClaimCanTakeTheTokenUp in src/engine/claimgate_test.go only covers the happy path, and it reads out and errs but never asserts on a failing code.

## done when

- se claim --these <id> --take answers non-zero when the take-up is refused, driven by a case in src/engine/claimgate_test.go: cd src/engine && go test -run TestAClaimCanTakeTheTokenUp -count=1 .
- se claim --these a,b --take says in its notice that take was not applied, driven by the same file

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | One switch where an if was, a code where zero was, and two cases in the test the token names. | |
| [x] | every done-when line is decidable, and names the command where one decides it | Both by the command the token names, go test -run TestAClaimCanTakeTheTokenUp -count=1, whose two new cases assert the code and the notice. | |
| [x] | the basics it stands on exist, or are minted first | Both stand: the verb already had the reason in hand and the notice to say it in. Nothing was minted. | |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Rule 12, red first. Rule 13, both halves: the code a caller reads and the notice a person reads, each driven. | |
| [x] | one test was written first and seen red for the reason expected | Red on both: a refused take-up answered 0, and two ids with take said nothing about the flag. | |
| [x] | the same test was seen green after the change, and named | TestAClaimCanTakeTheTokenUp ok, and every test over the claim, the claimant, the release and the publish ok beside it. | |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | began 3987b7c3e4c13204cbcd7748d8444ad2a515bfb7, ended on submission. | |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Nothing left over. The claim itself lands in the two-id case, so the code stays zero there and the notice carries what the flag did not do. | |

