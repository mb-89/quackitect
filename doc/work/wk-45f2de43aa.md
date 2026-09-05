---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: Find hides existing files
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-alder
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 8aee6baa518fa7fbe60a56c18bd50b603041525d
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 3a85abce06bd511d4bbe6de74fc2385802ebea0a
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

se_find reports a path as empty while 19 files sit there on disk and in the index's own tables. Two agents read that as a deleted tree tonight and acted on it.

The numbers, all taken within a minute of each other. dir /s /b dev_guide\*.md lists 19 markdown files, including coverage.md, cross-cutting/cross-cutting-design.md and the four level designs. se_ask counts 19 rows in file and 19 distinct paths in line_text under dev_guide/. se_find with path dev_guide/**, dev_guide/* and dev_guide/*.md each answer count 0.

The same shapes work elsewhere. se_find with path doc/guidance/** lists 11 files, and that folder holds 11 in both tables.

What differs about dev_guide: git has its files staged for deletion, D in git status, while they remain on disk. So a file git believes gone is hidden by find and still carried by the tables find reads.

THE COST IS NOT A MISSING HIT. The method tells every agent to search the tree through the index, so nobody checks the disk. I dropped wk-ea29109644 saying its ruling tables no longer existed. Another agent parked wk-c1af38084d for the owner on the same reasoning, and a third built a consolidation on it. All three rested on an answer of zero that meant something else.

## proposed action

Find the filter. Whatever hides a path staged for deletion should hide it from every table find reads, so the index is consistent with itself. Or it should not hide the path at all, and let the caller see what is on disk.

An answer of zero for a path that has rows in file and line_text is the bug, whichever way it is resolved.

Then say it in the answer. A path with no hits reads the same as a path that is not there, and those are different facts.

## done when

- A test indexes a file, stages its deletion in git, leaves it on disk, and asserts se_find by path still finds it. It is seen red before the change and green after
- se_find with path dev_guide/* lists 19 files, matching what dir and the file table both say
- A path with rows in the file table never answers count 0: a test asserts the two agree

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | One rule, one test file, no source change. | 1 file |
| [ ] | every done-when line is decidable, and names the command where one decides it | The first line cannot go red, which is the finding. find reads the file table and never git, so a staged deletion hides nothing. The real cause, LIKE reading an underscore as a wildcard, was fixed at HEAD before this was pulled. The second is decided by se_find, which answers 19 under dev_guide/** and 5 under dev_guide/*, not 19 under *. The third is decidable, and it is TestEveryIndexedPathIsFound. | se_find |
| [x] | the basics it stands on exist, or are minted first | Ask, Find, aTreeToIndex and aFedDaemon all existed. Nothing was minted first. | index_test.go |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Rule 12: red seen against the pre-fix query. Rule 2: a criterion that cannot go red is the finding. | rules 2, 12 |
| [x] | one test was written first and seen red for the reason expected | findagrees_test.go first. Without the ESCAPE clause it hid 3 of 8 indexed paths. | 1 FAIL |
| [x] | the same test was seen green after the change, and named | Both ok, with three find neighbours. | 5 ok |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | A check only. likePrefix at HEAD already fixed it, and find never reads git. | find.go |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | None. dev_guide lists 19 under ** and 5 under *. | 19 files |

