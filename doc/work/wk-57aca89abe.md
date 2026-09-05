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
status: open
claimed_by: 547b9365/worker-relay-trial
claimed_at: "2026-09-05T15:22:50Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - efc91dbad870deceb25298b4e476b99beb541273
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

