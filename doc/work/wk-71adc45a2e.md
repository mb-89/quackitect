---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: settled leaves phantom stretch
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-holly
claimed_by: 547b9365/worker-holly
claimed_at: "2026-09-05T20:09:38Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 3d0467d165f48e4b59a8fe6bde4815776a189063
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - c442e7bd3de70e1d8664e5159bd0e9b0a7f5bffe
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: "A shell submission no longer reads the queue, so no token is taken up and none is put back: the phantom began and ended are gone, and so are the two snapshot commits behind them. The payload carries settleOnly, which the verb sets and the JSON cannot. Landed on origin/v4 as 0577f58a6084d25da274364a93851426fb4070ef."
---

## detail

wk-963dbf6898 landed the settled answer at src/engine/pullverb.go:83. Pull has already taken the next token up when the shell branch puts it back, and take() at src/engine/pull.go:829 opens a stretch while PutDown at src/engine/pull.go:1022 closes one. So every shell submission writes a began snapshot and an ended snapshot onto whatever token the queue would have handed on, plus the two snapshot commits behind them.

Measured on the change with a probe test: an untouched standard token went from began=[] ended=[] to began=[ad9db31730907f76f36a477a4dbeab45f8ea338f] ended=[8ed6ccfa9f37a302cf7f7d5240cd36ef0e0d7427] after one shell submission that never named it.

That token's record now says it was in a hand it was never in, and the reviewer who later runs git diff began..ended over its last pair reads an empty stretch.

## proposed action

Do not open the stretch that is closed a moment later: answer the settled submission without taking the next token up, or put it back in a way that leaves began and ended alone.

## done when

- a shell submission leaves the Began and Finished of the token the queue would have handed on exactly as they were, proved by a Go test in src/engine

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | One field, one early return, and the verb branch it replaces. 71 insertions over three files, 43 of them the test. | commit 0577f58a |
| [x] | every done-when line is decidable, and names the command where one decides it | The one line is decided by TestAShellSubmissionOpensNoStretchOnTheNextToken. It reads Began and Finished either side of a shell submission. go test decides it. | shellsubmits_test.go |
| [x] | the basics it stands on exist, or are minted first | Nothing missing. The door was already on the call, and aPullAnswer already drives a pull through it. Both were left by wk-963dbf6898. | shellsubmits_test.go |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Rules 11 and 12. Of the two fixes offered, this is the first: do not open the stretch. | pullverb.go |
| [x] | one test was written first and seen red for the reason expected | Written first. Red naming the pair it should not have: began [7ea5cc87], ended [e15ca037]. | shellsubmits_test.go |
| [x] | the same test was seen green after the change, and named | Green, with the three wk-963dbf6898 left. Same seven suite failures before and after. | go test, v4 worktree |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Not in this tree, which is 339 commits behind v4. Done on a worktree of origin/v4 and landed as 0577f58a. | where it was done |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The verb's put-back is gone with the branch that needed it. | 0577f58a |

## evidence: where it was done

The engine snapshots this tree, and the work did not happen in this tree. This clone sits 339 commits behind origin/v4. So it was made on a fresh worktree of origin/v4, checked there, and pushed.

The fix is the first of the two the token offered. The verb used to read the door after Pull had already read the queue, so the put-back was undoing a take-up. Now the payload carries settleOnly, the verb sets it, and answerFor returns the settled answer without reading the queue. Nothing is taken up, so nothing is put back and no snapshot commit is written.

settleOnly is unexported on purpose. Which door an ask came through is the engine's own reading. A field the JSON could set would let a lane opt out of being handed work.

v4 moved twice mid-flight, and the patch was re-applied on the tip each time. The pushed tree was then checked again. It is the tree these answers describe: gofmt clean, build and vet 0, the four shell tests green.

