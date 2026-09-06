---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: head tests half landed
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-piranesi
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 1ae31b4a7f7a66d349a57b96b283512747109fe1
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 70ab59ad75a93cb4ea62513c50302b88ef4b8fa1
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

The engine's source builds from a clean copy of the branch head again, and its test package does not.

MEASURED on a clean copy of the head with wk-0f91286ac1's repair in it. `go vet ./...` in src/engine answers `cancelends_test.go:27:20: cannot use ctx (variable of interface type context.Context) as Roots value in argument to realGit`. A test run answers `claimsfile_test.go:67:49: undefined: claimsFile` and `claimsfile_test.go:89:10: undefined: nextClaimsFile`.

Both test files are committed. Neither of the things they name is: realGit on the branch takes a Roots first, and no committed file declares claimsFile or nextClaimsFile. They were written against a claims layer that takes a context and keeps one claims file, and that layer is in nobody's commit.

THE DAMAGE. Every test over the engine still answers FAIL at the build on a clean checkout, so the suite is dark for anyone who tests the way a reviewer is told to.

Either the layer those tests read lands, or the two files come off the branch until it does.

## done when

- a clean copy of the head runs a named engine test rather than failing at the build, decided by: git archive HEAD into an empty folder, then go test -C src/engine -run TestARationaleIsNamedNotRepeated ./ exits 0
- go vet -C src/engine ./... over that same copy exits 0

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | A reviewer testing the way the method says gets a running suite rather than a build failure. | criterion one |
| [x] | what breaks if it is never done, and not only that it stays undone | Every engine test stays dark on a clean checkout, so nothing red can be told from nothing run. | the detail |
| [x] | the ask is small enough to review whole, or it is split first | — | two files |
| [x] | every done-when line is decidable, and names the command where one decides it | Both name a command over a clean copy of a commit. Both were run at the tip and at the commit before the repair. | piranesi-head-red.sh |
| [x] | the basics it stands on exist, or are minted first | — | claim.go |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | — | work-token |
| [x] | one test was written first and seen red for the reason expected | Over a clean copy of 65c3cfcb both commands exit one, naming realGit in cancelends_test.go and Publish in claimsfile_test.go. | pir-before |
| [x] | the same test was seen green after the change, and named | Over a clean copy of 32f4c872 vet exits zero, and the named test answers ok for the engine package. | pir-now |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | This token wrote nothing. The repair landed in e36ad513, which restored the context threading a push had reverted. | e36ad513 |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | — | wk-4bede61b24 |

