---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: commits stage by name
# where the token stands. The process owns these values.
status: done
# the person's own name for a group. It does not move the work
bucket: tests
# who did the work step, so the verdict is never theirs
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ddf7c8d56371642c84a9a587caddc9b832808871
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 28c49e3fcd312e3c87f7180ec22a7c8d5ff7515a
---

## detail

The rule to stage by path exists and was broken three times in one session. A commit that staged everything took a refusal a background sweep had cut out, and the message named a different subject. The guard sees every tool call of the turn with its path or command, so it can know which paths this turn wrote. Consumes wk-b13ade88e2.

## approach

The guard judges a git commit and a git add against the paths the record says this token wrote. A stage or a commit naming anything else is refused, by name. git add -A and git add . are refused in any form.

Two thirds of that is already here. commitpaths.go refuses a pathless commit and a stage of everything. stagestrangers.go judges git add against WhatThisTokenWrote, which is the apply journal.

So this departs from a set of paths kept per turn in a file. The record is the set, and nothing resets at the turn's end.

What is left is two things. A git commit naming paths is judged by nothing, so a commit of another hand's file goes through. And there is no escape.

The escape is a shell assignment before the command, because git refuses a flag it does not know. SE_STAGE_ANYWAY carries the reason, the call goes through, and the session log records both.

## done when

- a commit staging a path this turn did not write is refused naming it: se test --propose TestACommitStagesOnlyWhatTheTurnWrote
- git add -A and git add . are refused whatever the turn wrote: se test --propose TestStagingEverythingIsRefused
- the typed escape is allowed once and recorded: se test --propose TestTheStagingEscapeIsRecorded

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | A commit carries one hand's change, so origin builds from every commit. | the detail |
| [x] | what breaks if it is never done, and not only that it stays undone | 67 of the last 174 commits import a package the same commit does not carry. | stagestrangers.go |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | Rewritten to the shape the tree carries, naming the two gaps left. | the approach |
| [x] | every done-when line is decidable, and names the command where one decides it | Each names a Go test, run by se test --propose. | se test |
| [x] | the change is small enough to review whole, or it is split first | One walk, one escape, three tests. | stagestrangers.go |
| [x] | the basics it stands on exist, or are minted first | WhatThisTokenWrote, gitVerbAt and shellWords are here. | stagestrangers.go |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Each test was watched red on an assertion, then green. | work-token.md |
| [x] | the change follows the approach on the token, or the token says why it departed | The approach was rewritten first to the record-based shape, and says why. | the approach |
| [x] | se test --on this token answered ok, and what it ran is named | 18 Go tests green, the three new ones among them. Four note checks stay red over other hands' tokens, red before this change. | se test |
| [x] | the note says what changed and why, for a reader who was not here | Three changes, in the note below. | ## note |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The assignment bypass was found here and fixed here. | commitpaths.go |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | reviewing was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

## note

Three changes, all in the two guard files.

The stranger guard now walks git commit as well as git add. A commit takes a pathspec, and with one it commits those paths straight out of the working tree. So a commit needed no stage, and the narrow door stood open beside the one that was shut.

gitVerbAt now walks past a shell assignment. It read the first word, found neither a runner nor a flag, and gave up. So FOO=1 git add -A went past every guard in both files. The red that found it is in TestStagingEverythingIsRefused.

And there is an escape. SE_STAGE_ANYWAY="why" before the command opens the stranger guard for that one command, and the session log carries who, what and why. It does not open a stage of everything, because that names no path and there is nothing to mean.

