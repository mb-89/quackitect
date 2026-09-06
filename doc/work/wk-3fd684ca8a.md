---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: an update stages strangers
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tests
---

## detail

A stage that names no path is refused two ways already, and one shape gets past both.

commitpaths.go refuses git add -A, git add --all and a lone dot, because each takes the whole tree. stagestrangers.go refuses a named path the apply journal does not attribute to the token in hand.

git add -u, and its long spelling --update, is neither. It names no path, so the second guard has nothing to judge and lets it through. It is not in stagesEverything, so the first guard lets it through as well. What it stages is every tracked file another hand has changed, which is the same commit of strangers one step early.

It was seen while wk-ae2ac9d15f was worked, and left out of that change on purpose, because the refusal there names the path it refused and this shape has no path to name.

The refusal it wants is the one aStageOfEverything already prints, which tells the agent to name the paths.

The smallest case: with any token in hand, run git add -u and watch it go through.

## done when

- git add -u is refused, decided by: a Go test in src/engine calling ACommitCarriesStrangers with git add -u answers refused
- git add --update is refused the same way, decided by: the same test covers the long spelling
- a git add naming a path is still admitted, decided by: go test over the commitpaths tests in src/engine answers ok

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

