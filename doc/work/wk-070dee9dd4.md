---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: mint honours work flag
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 33592cf17b66762346f5d6eb4511eb8b10f38abd
  - 7fb4bc96726471fc554aa8e50213324956b80784
  - dd2d0bb89ee0830f963908c0f9da108e5f78c02b
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 2a6251ab77b028b512a44819395faf6b3c2ec73f
  - a6d8ec2a8713c3b7cf70e7c8d69c00455e42030b
  - b6293229670c56b4c82aeb7cde4cf2593c60ea2e
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

A mint against a scratch tree can land in the real backlog, and the person doing it does not see it happen. Two probe notes minted against a scratchpad landed in the real work folder and had to be aborted.

Reproduce it before fixing it, because the mechanism the original report named does not match the code. It said an untraced process resolves its folder through Roots.Private, which follows the driving copy. Roots.Private at src/engine/roots.go:195 does the opposite: it joins the work root with .se.

So either the work root is not set from the work flag on that path, which is a different defect in a different place, or the behaviour has changed and the report is stale. Nobody should edit anything until a run says which.

The damage is quiet, which is what makes it worth chasing. A mint in the wrong tree writes a real token under a real id, and the only sign is that it is not where it was asked for.

## proposed action

Run it first and say which of the two it is.

If the mint still writes into the driving copy, it lands under the folder the work flag names instead. If it does not, this token records what was run and what came back, and closes as not a defect.

Either way the answer names where the work root comes from on that path.

## done when

- a run says whether a mint naming a work folder still writes into the driving copy
- the answer names where the work root comes from on that path
- a test covers a mint against a work folder that is not the driving copy

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one function, one line on the client, one test | — |
| [x] | every done-when line is decidable, and names the command where one decides it | two are runs, one is a test | the answers are below |
| [x] | the basics it stands on exist, or are minted first | projectRoot and the client's root finding already existed | — |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | the defect was reproduced and then bisected before anything was edited | — |
| [x] | one test was written first and seen red for the reason expected | TestANamedWorkFolderThatMovesIsSaid named a function that did not exist | written before WorkMoved |
| [x] | the same test was seen green after the change, and named | TestANamedWorkFolderThatMovesIsSaid ok, 0.18s | se_test |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | began 33592cf17b66762346f5d6eb4511eb8b10f38abd | — |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | nothing else was revealed | — |

## evidence: what this does not do

The mint still lands in the project rather than in the folder named, and that is deliberate.

The test covers the resolution rather than a mint. That is where the decision is made, and a mint test would reach the same function through more machinery.

The outside-the-tree half has no test. It was run by hand and the client refused, naming the folder and how to start an engine over it.

## evidence: what was run

Reproduced first. A mint naming .se/scratchpad/probe wrote into this tree's own private folder, which went from 17 files to 18. The probe folder got nothing.

Then bisected. The same mint naming a folder outside the tree was refused: no engine is running over that folder, and nothing landed anywhere.

So the two halves differ by whether the named folder is inside a project.

The answer. FindRoots in src/engine/roots.go hands the named folder to projectRoot, which walks up to the nearest folder carrying .se. A folder inside a project therefore answers the project.

The walk is right. It is what lets a verb run from a subdirectory, and taking it out would split the record by directory. What was wrong is that it happened in silence.

So the client says it now. The same probe run again prints that the folder is inside the tree, and that anything minted lands there.

