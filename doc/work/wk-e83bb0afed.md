---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: driving discussion is full
# where the token stands. The process owns these values.
status: open
---

## detail

doc/guidance/driving-the-engine.md carries a Discussion chapter of 997 words, and src/schemas/guidance.schema.yaml allows a thousand. The schema also asks one Discussion chapter per starred Actionable. So the file can take a new rule and cannot take the reason for it. wk-b65222b6f1 met that wall and landed rules twelve and thirteen unstarred, which leaves the argument for claiming a block in a commit message where no agent reads it. Measured with python over the file, splitting on the Discussion heading and counting whitespace fields, which is what overWords in src/engine/schema.go counts.

## proposed action

Either compress the ten existing chapters to buy room for new ones, or decide that this file's Discussion is full and the argument for a new rule goes to doc/rationale, named from the rule. The second is cheaper and matches how workers-share-one-tree is already named from work-token.md rather than repeated in it.

## done when

- driving-the-engine.md Discussion sits under the cap with room for one more chapter, or a rationale note carries the argument for rule twelve, decided by: .bin/se.exe lint answering no guidance finding
- the reason an agent bound to the queue claims a block is readable from the guidance, by a link or a chapter, decided by reading doc/guidance/driving-the-engine.md

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

