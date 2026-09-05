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
status: open
claimed_by: 547b9365/worker-holly
claimed_at: "2026-09-05T20:09:38Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 3d0467d165f48e4b59a8fe6bde4815776a189063
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

