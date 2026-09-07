---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: sh -c hides commands
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tests
---

## detail

A shell wrapped in quotes hides the program it runs from every guard that reads pipeline.

Measured on this box against origin/v4 plus the change on wk-8c76f768c1. ATestRunByHand over `sh -c "cd src; go test ./..."` answered refused before the change and not refused after it. ASearchOverTheTree over `sh -c "cd src; rg -n LoadConfig ."` answered the same pair.

The catch was accidental. pipeline used to cut at every separator, quotes and all, so the semicolon inside the quoted argument split the string and the inner program became the first word of a part. Reading quotes was needed, because that same blind cut refused a search whose paths were all outside the tree. So the guards kept a catch they were never taught, and lost it when the cut learnt to read.

Nothing hides here yet. pipeline is read by the removal, loop, git clean, build, test and search guards, and each judges a part by its first word. A word like sh, bash or env carrying a -c argument is a command written inside one word, and no guard opens it.

The smallest case is one line: a shell with -c and a compound inside, judged by what it runs rather than by the word sh.

## proposed action

Where a part's first word is a shell taking -c, read the argument after -c as a command of its own and judge it with the same pipeline. One unwrapping is enough, and a shell with no -c is left alone.

## done when

- ATestRunByHand over a shell -c carrying a compound with go test inside answers refused, driven by a Go test in src/engine
- a quoted pattern is still not cut, decided by TestASeparatorInsideQuotesDoesNotCutTheCommand staying green
- go test over src/engine answers no failure the run before the change did not answer

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

