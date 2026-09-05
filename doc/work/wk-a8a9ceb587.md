---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: private writes prove nothing
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-sibelius
claimed_at: "2026-09-05T15:54:23Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 268a3202e6617346038dda09e20be9fe77a62f57
---

## detail

Found reviewing wk-70dde20ba7, "delta is the token's".

src/engine/tokenwrote.go, WhatThisTokenWrote, counts every journalled path towards proven: return wrote, len(wrote) > 0. deltaSince in src/engine/tests.go drops private material from the delta (isPrivateMaterial). The two disagree, so an apply under .se can prove a write that no delta will ever carry.

The engine tells an agent with nothing in hand to put its manifests and command files under .se/scratchpad through se apply, so a token whose applies are all private is the ordinary case, not a corner.

MEASURED, on a clean copy of HEAD (git archive HEAD, then src/engine): a token that applied .se/scratchpad/cmd.sh and then wrote byshell.md answered delta 0, whole false, why_whole empty, chosen 0. se test answers ok having run nothing over a tree that changed.

tokenwrote.go names this outcome as the thing it refuses: "Narrowing on an empty record would answer a green run over a change nothing looked at." The empty-record door is shut and this one is open beside it.

## done when

- a Go test in src/engine drives a token whose only apply is under .se/scratchpad and asserts the answer is not an empty delta with whole false
- WhatThisTokenWrote proves a write only on a path a delta can carry, so isPrivateMaterial decides proven the same way deltaSince decides the delta

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one loop body inside WhatThisTokenWrote, and one test file beside it. | `git diff -- src/engine/tokenwrote.go` |
| [x] | every done-when line is decidable, and names the command where one decides it | both are rows in TestAPrivateApplyProvesNothing, decided by the command below. | `go test ./src/engine -run TestAPrivateApply` |
| [x] | the basics it stands on exist, or are minted first | isPrivateMaterial existed, and deltaSince already read it. Nothing was minted. | src/engine/index.go |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | read. Red first, then green. | doc/guidance/work-token.md |
| [x] | one test was written first and seen red for the reason expected | TestAPrivateApplyProvesNothing failed saying the token answered an empty delta with whole false. On a clean copy at 5a83c225, because another hand's retro.go stops the build here. | `go test ./src/engine -run TestAPrivateApply` |
| [x] | the same test was seen green after the change, and named | green, with TestAPrivateApplyDoesNotSpoilAShareableOne, TestTheDeltaIsWhatThisTokenWrote and TestAShellWriteIsNamedRatherThanDropped beside it. The package's eleven failures are the ones it had before. | same |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | tokenwrote.go skips a private path, privatewrites_test.go drives both rows. | `git diff --stat began..ended` |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | none. The second test is the guard, and it reddens if the skip takes a shareable path too. | — |

