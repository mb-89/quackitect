---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: receipts nobody can follow
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tests
# true when this waits for a person rather than an agent
needs_human: true
---

## detail

Minted working wk-a53a299607, which asked for the check that finds these.

util/checks/a-receipt-names-a-token.mjs reads the last column of every checklist row in an open note. Where that column offers a work id, the id must be a note under doc/work or a row in the archive. A receipt is what a note hands a reader as the place to go next, so one nobody can follow is a ticked line resting on nothing.

se test --propose a-receipt-names-a-token names each one it refuses, with its file and line. Five stand today, in wk-08e2b5df73, wk-3b2bb11243, wk-5d80f3ac21, wk-669612e013 and wk-6a0b7f2d38.

The check is declared out in battery.sh against this token rather than listed, because every one of the five sits in an open note belonging to another token. A red check in the battery is a wall every agent waits behind.

THE ANSWER IS NOT THE SAME FOR ALL FIVE, and this is why a person is wanted. The archive has lost rows, which wk-2a0d33d3be and wk-7a32df0461 both carry. So an id that resolves nowhere here may have been minted and lost rather than never minted at all. wk-963dbf6898, one of the five, is named in a comment in src/engine/investigate.go as a token that carried real work, which reads like the lost kind.

Telling the two apart needs a search wider than this clone.

## proposed action

Each receipt names a token a reader can follow, or loses the id, and the check is listed rather than held out.

## approach

Take the five the check names. For each, look for the id beyond this clone, in the branches and the tags, before deciding. An id that was minted and lost belongs to the archive work rather than here, and the receipt can name where it went. An id that was never minted means the row was ticked on nothing, so either the work is minted now and the receipt points at it, or the row is unticked and says why. Then move the name out of the battery's out line into its list.

## done when

- a-receipt-names-a-token answers 0 failed over the tree. Decided by: se test --propose a-receipt-names-a-token
- the check is listed in battery.sh rather than declared out. Decided by: se test --propose checks-live-in-the-method, whose held-out half no longer names it

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

