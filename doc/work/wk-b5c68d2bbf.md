---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: desk token never pushed
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-aspen
claimed_at: "2026-09-05T21:25:34Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ecd5d8962b3de7481c08a4ab211c362c53bb80db
---

## detail

wk-120d7c9685, "no dates in git", author main, status done, claimed by 542bcda8/reviewer-ravel, exists on the claims ref refs/se/claims at ec254bab and on no commit of v4: `git ls-tree origin/v4 -- doc/work/wk-120d7c9685.md` answers nothing on 2026-09-05. A tracked token minted and worked on the desk box 542bcda8 reached origin only as a claim note, because the claim publishes the note and the box never committed the file. The work it records, a check against dates in tracked files, has no token on the branch to point at.

## proposed action

On the desk box 542bcda8: commit doc/work/wk-120d7c9685.md to v4 and push. Then ask whether a claim that publishes a token no commit carries should say so at the claim, since the claims ref is the one place that saw it.

## done when

- doc/work/wk-120d7c9685.md is on origin/v4, decided by: git ls-tree origin/v4 -- doc/work/wk-120d7c9685.md answers a blob

## evidence: note

The file is on origin/v4 already. git ls-tree origin/v4 -- doc/work/wk-120d7c9685.md answers blob ce95d9a3, landed by aa19106e, "work: 148 closed notes reach the branch", at 19:53 UTC today, after this token was minted. The copy on the branch reads status closed and disposition done, and the archive tag archive/wk-120d7c9685 exists beside it. Nothing was committed for this token. The question the proposed action asks is left here for the owner. A claim publishes a note that no commit of the branch carries, and the claims ref is the one place that saw it. So the claim could say so at the time. The sweep that landed the 148 notes is the repair, and a word at the claim would be the prevention. No open token carries that question.

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one file onto one branch, and it was already there |  |
| [x] | every done-when line is decidable, and names the command where one decides it | the one line names git ls-tree, which answers a blob |  |
| [x] | the basics it stands on exist, or are minted first | the note exists on the claims ref and on v4 |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | read. Rule 14: the check ran again and its answer is beside what was written |  |
| [x] | one test was written first and seen red for the reason expected | it cannot redden: git ls-tree origin/v4 already answers a blob, since aa19106e. That is the finding |  |
| [x] | the same test was seen green after the change, and named | git ls-tree origin/v4 -- doc/work/wk-120d7c9685.md answers blob ce95d9a3 |  |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | empty. The landing is aa19106e, by another hand |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | the question about the claim saying so is in the note above, for the owner |  |

