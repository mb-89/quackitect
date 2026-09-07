---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: fallback base hides change
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: archive
---

## detail

Found reviewing wk-8c3c71d77d, which added travelNotice.

src/engine/snapshot.go:145 answers the fallback with theSnapshotToDiff(r, t.Began), the newest began this box holds, and says "The newest one this box holds is X, so read the change against that."

theSnapshotToDiff was written for the test door, whose question is "what have I written since I last took this up". The reviewer's question is the other one: "what did the whole token write", which is the earliest began, not the newest. The newest began is the take-up of the step being reviewed, and it is taken AFTER the work landed.

Measured on wk-8c3c71d77d itself. Its notice named aa2d094a as what to read the change against. aa2d094a is the commit "wk-8c3c71d77d began", and d9ef4d39, which carries the whole change, is its ancestor:

  git merge-base --is-ancestor d9ef4d39 aa2d094a   -> yes
  git diff --stat aa2d094a..HEAD -- src/engine/snapshot.go src/engine/pull.go src/engine/snapshotssaywhentheyaregone_test.go   -> empty

So a reviewer who followed the notice would diff a base that already contains the change, see nothing, and report a change with no code in it. reviewing.md section 3 names that exact failure and says the token names the commit that carries the change, so read that.

The notice also says nothing about the ended side when that hash is the one missing.

## proposed action

In travelNotice (src/engine/snapshot.go), stop reusing theSnapshotToDiff for the reviewer's sentence. Walk t.Began from the front for the earliest hash this box holds, and prefer the commit the note names where there is one. Keep theSnapshotToDiff for the test door, whose question is different.

## done when

- travelNotice names a base the change is not already in: the earliest began this box holds, or the commit the note names, and the answer says which
- a Go test in src/engine puts a began list whose newest local hash is later than the change, and fails if the notice names that hash: se test --propose it
- the notice says what to read for the ended side when the ended hash is the one that stayed behind

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

