---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: view gained undeclared columns
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: surface
---

## detail

A finding on wk-6b12a25abb, "urgent goes out first", commit 6cbecc0a.

That token asked for an urgent flag and a sort key. Its hunk in util/views/work.base carries three things nothing asked for: a declared group named parked filtering ready_when != "", ready_when added to the left table's order, and ready_when: 220 in columnSize.

Nothing on the token, in its note, or in the commit message names them. The note's account of the editor half is "The work view names an urgent column and an urgent group", and that is all it names.

The dead weight is two-fold. A reader tracing why the left table grew a 220px column, empty on all but a handful of rows in a pane already 641px wide, finds it under a commit about urgency and cannot tell whether it was meant. And a verdict has to rule on a hunk no criterion covers, which is how a token stops being reviewable whole.

Both additions may well be right. The ask is that they say so on a token of their own, or that the note naming the change names them.

The check that catches the class: the driven editor check already reads the work view's cells, but asserts them one at a time and says nothing about the set, so a column arriving in the view file is invisible to it.

## done when

- the parked group and the ready_when column are either named by a token of their own or taken out of util/views/work.base
- the driven editor check asserts the left table's whole column set, so a column added to util/views/work.base without it turns the check red

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

