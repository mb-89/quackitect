---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: se_work cannot say successors
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-linden
claimed_by: 547b9365/worker-linden
claimed_at: "2026-09-05T20:41:52Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ae053aef8609d66c9d249bd0e88ce2f9a8931179
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 28a3fde5db4a8572bf8109a46ae5c50ded6250ae
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

A FINDING FROM WORKING wk-807ec259d0, which taught lane-carries-every-flag to hold both directions.

5e94c17c gave se work --abort its --disposition and --successors, so an abort can end a token as became. The lane's se_work tool was not given the fields. util/cage/tools.json advertises se_work with actor, depends_on, detail, done_when, needs_human, on, parent, process, proposed_action, title and tracked, and no successors.

So an agent at the lane cannot abort a token as became. It can say abort and it cannot say what the successors are, which is the whole of what became means. Only the shell can do it.

The check already says so. On a worktree of origin/v4 at b0f98d45, with no change of mine applied, node util/checks/lane-carries-every-flag.mjs answers FAIL se_work can say --successors, 1 failed, exit 1. That red is this token.

--disposition is passed over rather than failed, because its help opens with abort: and the check reads that as a companion of a door of its own. Whether the lane should be able to say it is the same question, and worth deciding with this.

## proposed action

Add successors to the se_work struct in src/mcp/lane.go, and decide --disposition with it. Regenerate util/cage/tools.json with .bin/se-mcp --tools. The check is the test: it is red now and goes green with the field.

## done when

- node util/checks/lane-carries-every-flag.mjs on a worktree of origin/v4 answers 0 failed and exit 0
- util/cage/tools.json advertises se_work with a successors field, decided by reading the file
- the note says whether the lane may say --disposition on an abort, and why

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | Two files: four fields on the lane's struct with the call behind them, and the tools.json they generate. | 2 files |
| [x] | every done-when line is decidable, and names the command where one decides it | Three lines. The check decides the first, tools.json is read for the second, and the third is answered below. | 3 lines |
| [x] | the basics it stands on exist, or are minted first | The abort the lane now sends is the engine's, landed as 5e94c17c, so nothing had to be minted first. | 5e94c17c |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token read. Rule 13 is why the door came with the field. | rule 13 |
| [x] | one test was written first and seen red for the reason expected | The check was red before: FAIL se_work can say --successors, 1 failed, exit 1. | 1 FAIL |
| [x] | the same test was seen green after the change, and named | It answers 0 failed, exit 0. The mcp package and vet are clean, and tools.json carries all four fields. | 0 failed |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Not this clone, which is behind origin/v4. It landed as 3912a572. | 3912a572 |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | In the change. The lane may say disposition: successors without it sends a became's ids on a drop, where the engine ignores them. | disposition |

