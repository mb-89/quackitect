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
