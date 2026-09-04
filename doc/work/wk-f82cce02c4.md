---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: four notes claim deletion
# where the token stands. The process owns these values.
status: open
---

## detail

Four notes say the dev_guide tree is deleted, and three of them add that the note is now the only surviving copy of a ruling. The tree is on disk and complete.

.gitignore line 21 ignores dev_guide, so git reports it as absent and a reader of git status concludes it is gone. The index disagrees and is right: se ask counts nineteen files under dev_guide, cross-cutting/cross-cutting-design.md and levels/level-0-design.md among them.

The notes are wk-788cca53e9, wk-aae03d4767, wk-a4c80456c2 and wk-b42f08ff8d. An agent picking any of them up today starts from a false premise, and one of them tells the reader not to go looking for lines that are there.

## proposed action

Strike the deletion claim from all four notes and say what is true instead: dev_guide is ignored by git and present on disk, so the index finds it and git status does not.

## done when

- no note in .se/work or doc/work says the dev_guide tree is deleted
- each of the four notes says instead that dev_guide is ignored by git at .gitignore line 21 and present on disk
- wk-aae03d4767 no longer tells the reader that level-0-design.md is gone, and names the file where the rulings are

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

