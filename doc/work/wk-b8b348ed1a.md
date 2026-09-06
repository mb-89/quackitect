---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: reds counted not causes
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
claimed_by: 7e7f0da1/worker-sorrel
claimed_at: "2026-09-06T21:20:14Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 0a0a91a6645a32fbd5b92336887390dc1829a7c9
---

## detail

The reds gate counts failures against places moved, so three tests waiting on one missing function demand three edits. The right answer is one, and the gate refuses it.

MEASURED, September 2026, on wk-5bc2b50b47. Four tests were written against AReadThroughTheEngine, a stub was added so they would redden on their assertions rather than on a build, and three went red. All three said the same thing: the function answers nothing. The implementation is one function in one file, and the gate answered THE LAST RUN LEFT 3 RED AND THE TREE HAS MOVED IN 1 PLACE(S) SINCE.

Two more edits were made and the count reached 2, still under 3. Each was real, and neither was what the reds asked for. That is the gate teaching padding, which is the opposite of what it exists for.

THE OWNER'S RULE IS RIGHT AND ITS PROXY IS WRONG. A page of failures answered by one edit is a guess. A page of failures with one cause answered by one edit is the fix. Places moved cannot tell those apart.

## proposed action

Count causes rather than reds. Reds that a stubbed-out function or an uncompiled package produced together are one thing, the way a build failure already counts one whatever it listed. Where the engine cannot tell, it keeps counting reds, so the rule only loosens where the answer is clear.

## done when

- a run is granted where every red names one function that answers nothing and one place moved, and a Go test drives it
- a run is still refused where the reds name different tests over different files and one place moved, and the same test asserts it

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

