---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: assignments past a runner
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tests
---

## detail

A finding from the verdict on [[wk-fa90ae2cdf]], which it blocks nothing of. gitVerbAt in src/engine/commitpaths.go skips a shell assignment only while past is empty, so the skip covers the first word alone. env and sudo are both runners, so with `env FOO=1 git add -A` the walk sets past to env, meets FOO=1, finds it is neither a runner nor a flag, and returns -1. No git is found and every guard resting on gitVerbAt is silent: the stage of everything, the commit that names no path, and the stranger walk. `sudo FOO=1 git add -A` goes the same way. That is the hole the hunk says it closed, one word further along.

## approach

Skip an assignment wherever a program name may still be pending, not only at the first word: the word before the program, whether or not a runner has been walked past. Drive it with rows for `env FOO=1 git add -A` and `sudo FOO=1 git add -A` in TestStagingEverythingIsRefused.

## done when

- git add -A behind a runner and an assignment is refused: se test --propose TestStagingEverythingIsRefused

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

