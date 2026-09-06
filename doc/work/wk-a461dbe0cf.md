---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a refusal exits nonzero
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tokenrules
---

## detail

runLint in src/engine/lint.go ends with if len(found) > 0 { return 1 }, and the refused list is not read there. wk-8ec7483730 introduced that list, and wk-8fb334b116 later made clean read as len(found) == 0 && len(refused) == 0 and left the exit code alone. So a tree with no findings on a box where golangci-lint will not start answers clean: false and exits 0.

Measured on this box: se lint over the tree answers six refusals, one per module, all golangci-lint saying it cannot load its config because it was built against go1.25 and the modules target 1.27.

Rule 15 of writing-go tells an agent to run se format and then se lint before every commit. A shell reads the exit code, so on a box missing a program the agent is told the tree passed while a whole class of rule was never checked. That is the difference the token that built the refused list set out to make visible.

What is gained by doing it is that clean and the exit code say the same thing, so a caller reading either gets the same answer.

What breaks if it is never done is that a box short a program goes on reporting green commits, which is the state the refused list exists to end.

## proposed action

Return non-zero from runLint when refused is not empty, the same condition clean already reads.

## done when

- a lint run with a program hidden and no findings exits non-zero, decided by: a test that hides the program over a clean fixture tree and reads the code
- clean and the exit code are decided by one expression, decided by: read runLint in src/engine/lint.go

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

