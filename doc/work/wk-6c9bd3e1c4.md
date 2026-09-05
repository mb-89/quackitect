---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: submission hands unclaimed token
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-linden
claimed_at: "2026-09-05T20:54:41Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 624f3933075e3b14fb9eaeffc464e96b20bda453
---

## detail

A pull that submits a token answers with the next one, and that one arrives unclaimed. It happened twice in one session, on wk-97b792ee13 and then wk-a383afdbbc. Each was a tracked token, held by the submitter, carrying no claim from this box. The next run or apply on it was refused: the token travels, and this box holds no claim on it. A bare pull claims what it hands over before it answers, so the refusal never follows a bare pull. The submission path answers from the queue without that step. So the door that says you cannot pull a token that is not claimed is open on one side.

## proposed action

Route the token a submission hands over through the claim step a bare pull uses, in src/engine/pullverb.go. A test submits one token through the shell door with a second tracked one open, and reads the claim on the second in the answer.

## done when

- a tracked token handed over by a submission is claimed by the submitter, decided by: a test in src/engine asserting claimed_by on the answer
- the run that follows such a submission goes through, decided by: the same test running one command on the handed token

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

