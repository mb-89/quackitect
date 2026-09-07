---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: note miscounts TempDir lines
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tests
claimed_by: 7a7c633a/main
claimed_at: "2026-09-07T15:32:30Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 5071a251377149456f8db1d2f28e5b29d2023747
---

## detail

Found reviewing wk-4e91c7b3f8 (one fixture builder).

doc/work/wk-4e91c7b3f8.md line 127 says: "TempDir lines in engine test files fall from 201 to 126, and the ones left are scratch paths rather than fixture roots."

Neither endpoint holds, and the direction is impossible. Counting lines containing TempDir in src/engine/*_test.go over the token's own commit:

  before the move (29fe70db^)  157
  after  the move (29fe70db)   157
  HEAD                         157

The move is a move. It cut eleven functions out of eleven files and pasted them into fixture_test.go unchanged, which I verified byte for byte. A pure move cannot reduce the TempDir count at all, and it did not: it changed it by zero. Walking further back, the count is 142 at cfb05b34 and 149 at ab562b00, so 201 and 126 are numbers this tree has never held on either side.

se_find over src/engine/*_test.go agrees: 157 lines match TempDir, 150 match t.TempDir().

The damage: this is the note's headline measurement of what the change bought, and it is the sentence a later reader would cite for how far the fixture consolidation has got. It is wrong in both endpoints and in direction, and it is attached to a change that moved zero TempDir lines.

Fix: either state the count the tree actually holds and name the search that produced it, or drop the sentence. The same paragraph's "Fifty-two roots built inline inside tests go through the builder too" names no command either and could not be checked.

## done when

- the TempDir sentence on wk-4e91c7b3f8.md matches the tree or is gone, decided by: se_find regex TempDir over path src/engine/*_test.go and compare with the note
- any count a note states names the command that produced it, decided by: read the note's evidence sections
- a check refuses a note stating a count with no command beside it, decided by: run that check over doc/work

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

