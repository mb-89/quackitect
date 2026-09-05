---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: flat count reddens strangers
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-relay-trial
claimed_by: 547b9365/worker-relay-trial
claimed_at: "2026-09-05T20:37:20Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - adf5b933088bb7cb5570a5310669d2e8c9a5d7f8
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - b6c47c9b04e47709841d2c07e5083972c28dbec2
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: the floor is HEAD in 330d4ee5, the battery names the check ok over a head nobody grew, and one file added to src/engine is refused by name
---

## detail

util/checks/the-flat-engine-only-shrinks.mjs records what the flat src/engine package held and fails when it rises, which is what it was asked to do. On a branch several hands push to, that failure lands on whoever runs the battery next rather than on the commit that grew the package.

Measured today: the number was recorded at 89 files and 29203 lines, and read 29239 an hour later, 29378 after one change of mine, and 90 files and 29730 lines an hour after that, each rise from a different hand. Every one of those runs is a red battery for somebody who grew nothing.

The count is right and the moment it speaks is wrong. It has to name the change that raised it, or be answered where that change is made rather than where the next battery runs.

## proposed action

Decide where the rise is answered. Either the check reads the number off the commit that last touched src/engine and names it in the failure, so the person who grew the package is the one it asks, or the battery reports the rise without failing and something at the point of the change refuses it.

## done when

- the battery over a branch head nobody has grown answers ok for this check: sh util/checks/battery.sh names it ok
- a change that grows the flat package is refused or named, decided by a run over a tree with one file added to src/engine

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one check rewritten, the floor read off HEAD rather than a number in the file | 330d4ee5 |
| [x] | every done-when line is decidable, and names the command where one decides it | the battery line for the check, and a node run over a worktree with one file added | 330d4ee5 |
| [x] | the basics it stands on exist, or are minted first | git ls-tree and cat-file --batch answer what HEAD holds, and the check is in the battery list | b83389ce |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | read, and each row below names its check and what it said | 330d4ee5 |
| [x] | one test was written first and seen red for the reason expected | the check as it stood over a worktree of b83389ce: 2 failed, 90 files and 29772 lines against 89 and 29378 | b83389ce |
| [x] | the same test was seen green after the change, and named | battery.sh over the worktree names the-flat-engine-only-shrinks ok, and one file added to src/engine answers 2 failed naming it | 330d4ee5 |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | began is adf5b933 here, and the change is 330d4ee5 on b83389ce, one file | 330d4ee5 |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | the number left with the floor, and the last commit on the package is named in its place | 330d4ee5 |

