---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: check stays red always
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-relay-trial
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - efc91dbad870deceb25298b4e476b99beb541273
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 6699c95d6758188c22a30c943425956aed102f18
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

tests-name-no-token has been red in every battery anybody has recorded, so it guards nothing: a check that is always red is one nobody reads, and the next real violation lands in the same line of output as the standing one.

The battery of 2026-09-05T14:50:44Z answered: FAIL src/engine/notesgohome_test.go:149, :150 and :167 name wk-0000000001, which is a token in the record. wk-7783c03017 records the same check red in batteries before that one.

The three lines are fixture ids in commands and a successors list, written years apart from the check's rule. util/checks/tests-name-no-token.mjs says what an invented id looks like: one character repeated, so wk-1111111111 and wk-aaaaaaaaaa read as fixtures and need no list to tell apart. wk-0000000001 is one character short of that and reads as a minted id.

This is the whole failure: nothing else in that check is red.

## proposed action

Write the three fixture ids in the shape the check calls invented, one character repeated, so the check goes green and stays a guard. Do not soften the check: the rule it holds is the one that keeps a test from depending on the record.

## done when

- no test file names an id the check reads as minted, decided by: node util/checks/tests-name-no-token.mjs at the root answers 0 failed
- the three lines still say what they said: the abort, the set and the successor each name one fixture id, decided by reading the diff
- the battery reports tests-name-no-token ok

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | three fixture ids, one character each | notesgohome_test.go |
| [x] | every done-when line is decidable, and names the command where one decides it | the check answers 0 failed, and a reader compares the three lines | the done when section |
| [x] | the basics it stands on exist, or are minted first | the check exists and has been red in every battery recorded | wk-7783c03017 |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | read. The check was not softened, which is what the token asked | work-token |
| [x] | one test was written first and seen red for the reason expected | the check is the test and was already red: the battery before this change names lines 149, 150 and 167 | the battery before |
| [x] | the same test was seen green after the change, and named | util/checks/tests-name-no-token, 0 failed | the battery after |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | the snapshots hold on this box | the token |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | none. Only the three ids changed, and each line still says what it said | notesgohome_test.go |

