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
status: open
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 24bbca99b1fdad1b370e05aa36e2ceae403e6fa3
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

