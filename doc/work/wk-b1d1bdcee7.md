---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: seven rows reach nothing
# where the token stands. The process owns these values.
status: open
---

## detail

A FINDING WHILE WORKING wk-7873576bbb.

util/checks/archive-rows-travel exits 1 on seven rows whose objects no clone of the branch reaches. The eighteen rows wk-7873576bbb added all pass, so these seven are the only thing left holding that check red.

Six name a tag and a blob: wk-3bad905ec0, wk-5002ef7c5f, wk-59f957dc38, wk-781c94fff2, wk-97e8bd9f38 and wk-f7153c420e. This box holds all 77 archive tags, so the note content for each is here. The branch never committed those notes, so there is no on_branch to fold in and se archive --sweep has nothing to write.

The seventh, wk-2493bf564a, names a blob and no tag. Its close wrote the blob with git hash-object, and no tree reaches it.

So each note lives on whatever box holds the object, and a clone of the branch reads nothing back.

## proposed action

Write each of the seven notes out from the object the row names, commit them under doc/work, then delete them and commit again. The blob stays reachable from HEAD after the first commit, even with no file left. Put that blob on its row as on_branch.

## done when

- node util/checks/archive-rows-travel.mjs . exits 0, with every row reading ok
- each of the seven rows carries an on_branch that git rev-list --objects HEAD reaches
- no note file is left in doc/work for any of the seven, decided by git status answering clean there

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

