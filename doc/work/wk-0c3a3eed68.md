---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: backslash merges two folders
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-nono
claimed_at: "2026-09-05T14:22:33Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 81be7157600206fd3f5ed0085d45fb4ee657c587
---

## detail

A FINDING FROM THE VERDICT ON wk-fc6b6c5aa7.

src/engine/hookserve.go:73. theSameFolderEveryTime replaces every backslash with a forward slash before the hash, on every platform. On POSIX a backslash is an ordinary character in a name, so /home/u/a\b and /home/u/a/b canonicalise to one string and hash to one port. Two real trees then answer one door: the second engine cannot bind it, runs with no door, and every guard over that tree is absent with nothing saying so. That is the class this token was written to shut, arriving from the other side.

Roots.Work comes through filepath.Abs, and Clean already folds separators for the platform it runs on, so the unconditional fold buys nothing on POSIX and costs a collision. The case fold two lines below is gated on a Windows path, which a colon in the second place tells, and the separator fold can read the same test.

## proposed action

Gate the backslash fold the way the case fold is gated. Fold backslashes only when a colon in the second place says this is a Windows path, and leave a POSIX path alone.

## done when

- TestOneFolderAnswersOneDoor carries a row asserting that two POSIX paths differing only by a backslash against a forward slash answer two ports, and that row is watched red before the change
- every row already in that table still passes: a Windows path in either drive case, with or without a trailing separator, with forward or back slashes, and with a doubled separator answers one port

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | One gate in one function, and the row in the table that decides it. | |
| [x] | every done-when line is decidable, and names the command where one decides it | Both by TestOneFolderAnswersOneDoor. The new row asserts that /home/u/a\b and /home/u/a/b answer two ports. The four rows above assert the Windows spellings still answer one. | |
| [x] | the basics it stands on exist, or are minted first | Both stand: the case fold already reads the colon test, and hooksPort already hashes what this function answers. Nothing was minted. | |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Rule 12, red first. Rule 11: this gate, and nothing beside it. | |
| [x] | one test was written first and seen red for the reason expected | Red on HEAD before the gate: the two POSIX spellings both answered port 31716, so two folders had one door. | |
| [x] | the same test was seen green after the change, and named | TestOneFolderAnswersOneDoor, with TestAStartLeavesTheSettingsAsTheyWere and TestTheCageSendsCallsToTheDoorAndWakesTheEngine. The shared tree will not compile while other hands are mid-change, so the three ran in a worktree off HEAD carrying this token's files. | |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | began 81be7157600206fd3f5ed0085d45fb4ee657c587, ended on submission. | |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Nothing left over. Worth saying: this token was archived done at 10:35 today with the gate not in the tree, so that close outlived the change it stood for. | |

