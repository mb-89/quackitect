---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the editor cuts branches
# where the token stands. The process owns these values.
status: done
# who did the work step, so the verdict is never theirs
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 1b2928e8b5e0b76853a9d51d66768d6622b0271d
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 771af4b6e7d5aa997ba43206886dd32afb67fc48
---

## detail

Marking a group in the work editor shows a rename button and nothing else. Cutting the branch for that group is a checkout somebody types at a shell, so the one surface a person uses cannot start the thing the whole group design is for. The engine verb that exists is the wrong one for a desk. se --group puts THIS tree on the branch, which is right for a box about to work the group and wrong for the person cutting it. A desk that has its checkout moved out from under it loses whatever it was doing. And a branch made without a push is one no cloud box can select, which looks like the button doing nothing.

## proposed action

A second verb beside the first. It makes the group branch off trunk and pushes it, and leaves this tree where it stands.

The name comes from the one place that already derives it, so a branch cut here and a queue narrowed there cannot disagree.

The editor draws the button beside rename, on the same selection, and calls the verb.

A branch that already exists is taken and pushed, and the answer says so rather than failing.

AN EMPTY GROUP DRAWS NO BUTTON, the way rename draws none with nothing selected. The refusal stays in the verb too, because a shell and a cloud box reach the verb where no button exists to hide.

## done when

- the verb makes the group branch off trunk and this tree stays where it stood, decided by: a Go test in src/engine
- the branch it made is on the remote, decided by: the same Go test against a local bare origin
- a branch that already exists is said so and pushed rather than failing, decided by: the same Go test
- the verb refuses a group with no open tokens, and says why, decided by: the same Go test
- marking a group with open tokens draws the button beside rename, decided by: the drive-editor check
- marking an empty group draws no button, decided by: the same check

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | The surface a person uses can start a group, rather than a shell somebody remembers. |  |
| [x] | what breaks if it is never done, and not only that it stays undone | The group design has no way in from the editor, so nobody uses it. |  |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | A second verb beside the first: cut off trunk and push, and do not move this tree. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | Four name a Go test, one names the drive-editor check. |  |
| [x] | the change is small enough to review whole, or it is split first | One verb, one flag, one button and its wiring. |  |
| [x] | the basics it stands on exist, or are minted first | The branch reading and TakeTheGroupBranch landed first. |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | The criteria were on the token before any code. |  |
| [x] | the change follows the approach on the token, or the token says why it departed | A second verb beside the first. It cuts off trunk, pushes, and this tree does not move. |  |
| [x] | se test --on this token answered ok, and what it ran is named | drive-editor draws .bs-cut-branch, one per instance and none outside one. Its one other failure is older than this change and its count did not move. |  |
| [x] | the note says what changed and why, for a reader who was not here | The verb is in branchcarriesthegroup.go, the flag in main.go, the button in editor.ts, and the wiring in extension.ts. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The bundle VS Code runs was two days stale. A check now says so, and wk-ea5cb1ff40 makes the engine rebuild it. |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

