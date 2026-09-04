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
status: open
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

