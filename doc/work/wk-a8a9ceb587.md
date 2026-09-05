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

