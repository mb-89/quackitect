---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: shell test assumes windows
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-hawthorn
claimed_at: "2026-09-05T16:05:25Z"
---

## detail

TestTheShellIsFoundBesideGitWhenPathHasNone in src/engine/posixshell_test.go fails on Linux and passes on Windows. Measured on 2026-09-05 in a worktree of cf8e1d4e on a Linux cloud box, inside sh util/checks/battery.sh: `posixshell_test.go:44: it resolved \"sh\" where Git's shell is \"<tmp>/Git/bin/sh.exe\"`. The test plants a Windows Git layout and empties PATH, and on Linux the resolver still answers sh, because a POSIX box has one. The owner's desk battery is green on the same commit. A test that is red on one platform the battery runs on is a test the battery cannot be trusted on there.

## proposed action

Either the resolver on a POSIX box prefers the shell beside git when PATH has none, or the test says it is about Windows and skips elsewhere, with the reason on the skip. Which one is right is the token's first question, and the answer is measured against what batteryShell does on both platforms today.

## done when

- go test -C src/engine -run TestTheShellIsFoundBesideGitWhenPathHasNone ./... answers ok on Linux and on Windows

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

