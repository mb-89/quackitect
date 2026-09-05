---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: branch head misses fixtures
# where the token stands. The process owns these values.
status: open
---

## detail

A clone of the branch cannot build the engine's tests. Committed test files call aTreeWithTheProcesses and aTreeWithAnEchoingCheck, and at the head nothing defines either: both live in src/engine/fixture_test.go, which is on this box and in no commit.

Measured at head ae4a7cc7 in a detached worktree, with nothing overlaid: go test -run TestARationaleIsNamedNotRepeated answers "undefined: aTreeWithTheProcesses" from archivedreadsclosed_test.go, askedisgranted_test.go, authornotreviewer_test.go and challenge_test.go, and "undefined: aTreeWithAnEchoingCheck" from checkengine_test.go.

The move of the fixtures into one file landed as a commit that deleted the old definitions and an untracked file that holds the new ones. util/checks/the-branch-head-builds is the check that answers this question, and it is failing for every box that has only the branch.

Found while working wk-913908cbd1, which had to overlay this tree's uncommitted work to run a test at all.

## done when

- a detached worktree of the branch head builds the engine's tests, decided by: git worktree add --detach /tmp/head HEAD and go test -count=1 -run TestNothingAtAll ./src/engine
- node util/checks/the-branch-head-builds.mjs . exits 0

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

