---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: six archived notes lost
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: archive
# true when this waits for a person rather than an agent
needs_human: true
---

## detail

SIX ROWS OF THE ARCHIVE NAME A NOTE NO CLONE CAN READ. archive-rows-travel answers 6 failed on origin/v4 at b7ea71c0. Each row carries a blob hash and a tag, and neither is reachable from the branch: the note was closed on some box, the archive wrote it behind refs/tags/archive on that box, and a push to refs/tags is refused from a cloud box. The row travelled and the note did not. The six are wk-3bad905ec0 lane socket mirrors engine, wk-5002ef7c5f battery names new check, wk-59f957dc38 stop argument test fails, wk-781c94fff2 battery marker outlives run, wk-97e8bd9f38 hook path takes context, and wk-f7153c420e cloud card answers here. None of them is in this clone, its undo folder, or its record, so nothing here can put them back. The box that closed each one still holds the tag if that box is alive. se archive --sweep on that box puts the note into git, and a push carries it. That is the only repair, and it is a call about which boxes are still up.

## proposed action

On each box that closed one of the six, run se archive --sweep and push. Where the box is gone, rule the note lost and say so on the row, so the check can tell a loss somebody ruled from one nobody noticed.

## done when

- archive-rows-travel answers 0 failed on a worktree of origin, decided by: node util/checks/archive-rows-travel.mjs on that worktree
- every row it once refused either names an object the branch reaches or carries the ruling that its note is lost

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

