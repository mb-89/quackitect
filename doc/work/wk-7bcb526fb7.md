---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: ready_when cites stale wall
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-alvar
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 24bbca99b1fdad1b370e05aa36e2ceae403e6fa3
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 07fc266aa4fd9790c226bd9d05a868fac02ad23a
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

wk-cf33c85301 is parked, and its ready_when names the engine test build as one of its walls, citing wk-4140e954b7 for it. That citation reads as a code fault in the package. It is not one. Measured with CGO_ENABLED=1 GOFLAGS=-tags=sqlite_fts5 go test -C src/engine -run TestNothingAtAll ./... run twice. On this clone it answered two errors, both in snapshotnevertravelled_test.go, calling TestTheDelta with a context. On a detached worktree of the branch tip it answered exit zero and no build failure. The tip carries commit 735ebc83, which gave TestTheDelta a context parameter, and this clone's HEAD does not. So a reader of wk-cf33c85301 looks for a broken package and finds a clone that is behind.

## proposed action

Correct the ready_when on wk-cf33c85301 so the build sentence names the clone being behind the branch tip rather than a fault in the package. Leave its other two walls, the shared engine swap and the two other tokens in lint.go, as they stand.

## done when

- the ready_when on wk-cf33c85301 no longer says the package fails to build its tests, decided by: read that line beside the two build answers above
- the ready_when on wk-cf33c85301 names the clone being behind the tip as the reason a Go red cannot be watched here, decided by: read that line

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | A reader of wk-cf33c85301 stops hunting a package fault that is not there. | read |
| [x] | what breaks if it is never done, and not only that it stays undone | The wall keeps citing a build the branch tip fixed a while ago. | measured |
| [x] | the ask is small enough to review whole, or it is split first | One sentence of one field, and the other two walls stay. | one line |
| [x] | every done-when line is decidable, and names the command where one decides it | Both are decided by reading that field beside the two build answers. | read |
| [x] | the basics it stands on exist, or are minted first | wk-cf33c85301 and its ready_when are both on the branch. | read |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | The work-token guidance came with the pull and shaped this answer. | read |
| [x] | one test was written first and seen red for the reason expected | The token names reading as its check, and the old sentence failed it. | red |
| [x] | the same test was seen green after the change, and named | The field now names the clone being behind, not a package fault. | green |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Landed at the branch tip as commit adc209a9, one file. | adc209a9 |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The clone being behind is already wk-65c53d4b97 and wk-4140e954b7. | those two |

