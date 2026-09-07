---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a land clobbers rows
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
---

## detail

land.sh copies a whole file over the branch tip. For doc/work/archive.jsonl that is not a landing, it is an overwrite, and every row landed since this disk last matched the branch goes.

MEASURED, 2026-09-07. Over the last fourteen commits touching that file, exactly one lost rows. It took the file from 99 rows to 75, dropping 25. Another hand restored 3 and named the mechanism, and the remaining 22 were restored at 953eb27. Twenty of the 22 were closed the same day, several of them minutes earlier.

Nothing warned. The land printed PUSHED, and no answer carries a row count. The archive checks read the rows that are there and cannot see rows that are gone.

THE FILE IS WRITTEN BY EVERY HAND AND BY THE ENGINE. A sweep rewrites it whole. So the copy on the disk at the moment of a land is not a superset of the branch, which is the assumption land.sh makes for every path it carries.

This is the live half of wk-7a32df0461, which carries the older instance where the same file went from 380 rows to 12.

## proposed action

Have land.sh merge this one file rather than copy it. Read the tip's copy, read the disk's, keep every row from both, and prefer the disk's where an id is in both. A land can then only ever add rows. Say the count it wrote and the count it took from the tip, so a loss shows in the answer rather than three commits later.

## done when

- a land over a tip whose archive holds a row this disk lacks keeps that row, and a Go test against a real bare origin drives it
- a land still carries a row this disk holds and the tip lacks, proved by the same test
- the land says how many rows it wrote and how many came from the tip

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

