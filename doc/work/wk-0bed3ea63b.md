---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: four checks nobody runs
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tests
# true when this waits for a person rather than an agent
needs_human: true
---

## detail

Found working wk-2628c2a721, which had to add a check to the battery's list.

checks-live-in-the-method fails over the tip, and has for some time. Its last line reads: archived-notes-are-gone, commands-mirror-the-keywords, criteria-name-a-runnable-command, the-bundle-is-not-stale sits in util/checks and the battery never names it, so it is a check nobody runs.

Measured on 2026-09-07, before and after adding comments-name-open-work: one failure both times, on the same four names. So the four predate this work and nothing here caused them.

battery.sh has a door for a check held out on purpose. out="name:wk-0123456789" declares it, and checks-live-in-the-method refuses a declaration with no token. So a check is listed, or held out beside the token that holds it out, and these four are neither.

Two of the four are red over the tree today. archived-notes-are-gone fails on notes that are on disk and already in archive.jsonl, which is the same archive gap wk-2a0d33d3be and wk-7a32df0461 carry. Listing a red check reddens the battery for everybody, and holding one out needs a token, so which of the two each of these gets is not a decision this box can take.

## proposed action

Each of the four is listed in battery.sh, or declared out beside the token that holds it out.

## approach

Run each of the four through se test --propose and read what it says. A green one is added to the for c in list. A red one is declared out as name:token, against the token that carries its failure, and archived-notes-are-gone already has two candidates in wk-2a0d33d3be and wk-7a32df0461. The last criterion is decided by the same check that reports the gap.

## done when

- each of the four is listed in battery.sh or declared out beside a token. Decided by: se find --regex 'archived-notes-are-gone|commands-mirror-the-keywords|criteria-name-a-runnable-command|the-bundle-is-not-stale' --path util/checks/battery.sh
- checks-live-in-the-method no longer names a check nobody runs. Decided by: se test --propose checks-live-in-the-method answers ok
- every check declared out names a token that exists. Decided by: the same check, whose held-out half refuses a declaration with no token

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

