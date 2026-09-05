---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: fed git honours context
# where the token stands. The process owns these values.
status: open
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 143237f6d3ebddf4497298c098cfb5c00d4160b4
---

## detail

From the verdict on wk-30821724fc, spawns take a context.

gitRuns is the seam every claim test feeds, and the fake behind it now takes the context and throws it away: src/engine/gitfed_test.go line 48, `func (f *fedGit) run(_ context.Context, r Roots, index string, args ...string)`. The second fake, the closure at gitfed_test.go line 257, names ctx only to pass it on to fed.run, which drops it.

So nothing asserts that a cancelled context reaches git through Publish, writeTheClaims, SyncClaims or WatchForClaims. The one cancel test the token added, TestACancelledContextEndsAGitCall, calls realGit directly and goes nowhere near those five. A later caller that reaches gitIn with a context it made itself, or with a context it never threads, passes every claim test in the tree.

Have fedGit.run answer ctx.Err() when the context is already done, and add one test that cancels and sees SyncClaims (or Publish) come back with the cancellation instead of a fetch.

## done when

- fedGit.run answers ctx.Err() when its context is done, decided by: se find --regex 'func \(f \*fedGit\) run' --path 'src/engine/gitfed_test.go' shows a named ctx parameter
- a cancelled context ends a claim sync through the seam, decided by: go test -C src/engine -run 'ACancelledContextEndsASync' ./... answers ok
- sh util/checks/battery.sh reports no new failure against the run before the change

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

