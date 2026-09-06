---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: pull hands unclaimed token
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-linden
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 624f3933075e3b14fb9eaeffc464e96b20bda453
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 9b9920d130dbcc05dd59ab461414bd1c2cb71225
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

A pull answers with a tracked token nobody has claimed, and the next write on it is refused. Seen four times in one session, on wk-97b792ee13, wk-a383afdbbc, wk-2422eef2d3 and wk-a82935e32b, after a submission and after a bare pull alike. Each arrived held by the puller and carrying no claim from this box. The run or apply that followed was refused: the token travels, and this box holds no claim on it. The pull hands out what you claimed before what nobody has, and then hands out what nobody has without claiming it. So the rule that a token is claimed before it is pulled is open on the pull's side. Every agent claims by hand after every pull.

## proposed action

Claim the tracked token a pull hands over, for the puller, before the answer goes out, in src/engine/pull.go where the queue picks what nobody has. A test pulls with one tracked token open and nothing claimed, and reads claimed_by on the answer.

## done when

- a tracked token handed over by a submission is claimed by the submitter, decided by: a test in src/engine asserting claimed_by on the answer
- the run that follows such a submission goes through, decided by: the same test running one command on the handed token

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | Three files: the claim on the handout, the publish on the verb, and one test. | 3 files |
| [x] | every done-when line is decidable, and names the command where one decides it | Two lines, both in TestASubmissionHandsAClaimedToken: it reads claimed_by off the answer and then runs one command on the token it was handed. | 1 test |
| [x] | the basics it stands on exist, or are minted first | The gate and the claim are both in the tree, so the handout asks them rather than deciding anything of its own. | the gate |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token read. Rule 13 is why the claim reaches the branch in the same change. | rule 13 |
| [x] | one test was written first and seen red for the reason expected | Red on all three: claimed by "", the gate refuses the token the queue just handed over, and the run answered that refusal. | 1 FAIL |
| [x] | the same test was seen green after the change, and named | It passes, vet is clean, and the whole engine suite answers the seven failures it answers without this change. | ok |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Not this clone, which is behind origin/v4. It landed as 86b32874. | 86b32874 |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | In the change. A bare pull never claimed either, and the fix is in the handout both paths go through. | take |

