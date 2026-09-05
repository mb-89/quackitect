---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: retro tests lack method
# where the token stands. The process owns these values.
status: open
---

## detail

Six tests in src/engine fail on a worktree of origin/v4, before and after wk-ada3f57238, so the fault is not that change. Measured over worktrees of 9a7186af and 6c2c1ed7 under /tmp on a Linux box, go test -count=1 with CGO on and -tags=sqlite_fts5:

  --- FAIL: TestARetroLeavesAnotherActorsFolder
  --- FAIL: TestARetroLeavesTheSourcesEmpty
  --- FAIL: TestASecondRetroTakesNothingTwice
  --- FAIL: TestARetroTakesTheRunningSessionToo
  --- FAIL: TestARetroCollectsAndDrains
  --- FAIL: TestAVerbRunsInsideTheEngineAndTheClientPrintsIt

Every one fails the same way. retro_test.go:63, :90, :116, :378 and :463 answer se retro: exit status 1, and liveengine_test.go:112 answers that help without an engine said the same on the reason stream: engine: no method root here. This program looked up from where it is for a folder carrying src/processes and found none, so every path under the method would be a guess. Name it: --method <folder>.

The suite says it drives /tmp/se-engine<n>/se, built now from the tree. The binary sits under /tmp, and nothing above /tmp carries src/processes, so a lookup that starts from the binary rather than from the working folder or a named --method cannot find the method. Whether these tests hand the binary a method, or the lookup starts from the wrong place, is what needs deciding. The other 240 or so tests in the package pass on the same run.

## done when

- the six tests named pass over a fresh worktree of origin/v4 under /tmp, decided by: go test -C src/engine -count=1 -run 'TestARetro|TestASecondRetro|TestAVerbRunsInsideTheEngine'
- the reason they failed is written on the token: which lookup started where, and what now names the method

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

