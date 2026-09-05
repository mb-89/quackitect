---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: Overnight report for owner
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 769f3d03b480cb0349a280ec34011149840dbe3d
  - 372f591683274a45462e179d28036ad132983613
  - f68bd795983fc5430a7efa72a91db539c153979e
  - 520d3271bbc80b9095eb32660ce922b252905020
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 525f358c222891710d14505b475ad53b56b06cff
  - 1031e9b8ad89dce72112f0712ae9f04e1504029c
  - ad51a11fc735d41cf96482a5382311d1124271d9
  - a42a4b9f1c87771d28da3db3e4d521536aa108db
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

The owner is away for the night. They asked for a written report to read in the morning, in a markdown file rather than in chat. Their words: "when everything is done that can be done, then before you shut down the machine". And then: "then I want you to write me a report over what you did. And do not write it in the chat. Write it in a markdown where I can read it."

Without it the night's findings live only in tokens and in the engine's log, which is not one thing a person opens and reads through.

## proposed action

Write overnight-report.md at the root of the tree. Bottom line first, which is the one action that unblocks everything else. Then each thing the owner asked for and where it stands. Then what blocked the night, the findings raised with their ids, and what needs their judgement rather than mine.

## done when

- overnight-report.md exists at the root of the tree and passed the voice check the engine applies on write
- It names the state of each thing the owner asked for. Those are the dead comments in processes, the UI liveness and rendering, and the battery stopping the engine
- It names every token minted tonight by id, one line each
- It says plainly what was not done and why, including any judgement the owner should check

## evidence: how this closed

The owner read the report and said it is done and no longer needed.

They ruled on it directly, in this session, and said to close it on their authority. That is the evidence, and it is the only kind this token could have.

The two test lines are answered rather than ticked. This token wrote prose for a person to read, so there is no check that goes red on it. The owner reading it is the check, and they have.

The queue handed this token out four times in one session, which is why it carries four began hashes. It stayed open after the report was written.

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one file, written once | — |
| [x] | every done-when line is decidable, and names the command where one decides it | each names what the file has to hold, and the owner read it | — |
| [x] | the basics it stands on exist, or are minted first | the tokens it reports on all existed | — |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | the token carries the owner's words for what they asked | — |
| [x] | one test was written first and seen red for the reason expected | none was written, and none applies to a report a person reads | see below |
| [x] | the same test was seen green after the change, and named | none, for the same reason | see below |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | the token carries four began and three ended hashes | — |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | nothing was revealed | — |

