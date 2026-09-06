---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: Two guards one rule
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: queue
---

## detail

pull.go asks Unleashed twice for one rule. Line 194, in answerFor, came from wk-8797959d3c. Line 272, in whatComesNext, came from wk-b750954b82. Two boxes fixed the same defect at the same hour and both cuts merged cleanly. Nothing is broken and every unbound test is green. But one rule with two writers is the fault this project keeps finding, and the next hand reading either site will not know the other is there.

## proposed action

Keep the cut that sits closest to the queue and drop the other. Leave one comment naming what unbound turns off, so a reader finds the whole rule at one site.

## done when

- src/engine/pull.go asks Unleashed at one site for the hand-out, decided by: se find with regex Unleashed over path src/engine/pull.go returns two hits, the hand-out and AskToStop.
- TestAnUnboundPullIsHandedNothing and TestUnboundTakesTheQueueOffEveryPathThatIsTheQueue both pass, decided by: se test naming both.

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
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

