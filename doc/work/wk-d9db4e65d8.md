---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: uncovered cannot see shell
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
claimed_by: 7e7f0da1/worker-sorrel
claimed_at: "2026-09-06T20:57:54Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 25a07a89a40f0bd6dd2d44e76d8874d776e3013e
---

## detail

se test answers uncovered for every changed file no test reaches. The reach it consults is test_region, and test_region is filled from Go coverage profiles, which describe Go statements only. So a shell script can never appear there, and every change to one is reported uncovered whatever tests drive it.

MEASURED: se test --on wk-fcdadf13cb, over a change to util/git/land.sh carried by three Go tests that run that script end to end against a real bare origin, answered ok true and uncovered ["util/git/land.sh"].

An uncovered line that is structurally true of a whole language teaches the reader to skip the field, which is the same wearing-out that made the stop hook's git line worthless.

## proposed action

Keep a file out of uncovered when its language has no coverage profile. Where it stays, say why in words that do not read as a missing test.

## approach

The decision is at src/engine/tests.go:379, where a delta entry no test_region row reaches is appended to Uncovered. Read what languages fill test_region, and gate that append on the changed file being one a profile can describe.

## done when

- a change to a shell script that a go test drives is not reported uncovered, decided by: se test over a delta holding only util/git/land.sh answering an empty uncovered
- a change to a go file that no test reaches is still reported uncovered, decided by a test that drives both halves

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

