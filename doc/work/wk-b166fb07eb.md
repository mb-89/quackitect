---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: comments in plain register
# where the token stands. The process owns these values.
status: open
# what has to be true before this is worth reading again
ready_when: "the owner says the capitals headline goes. The tree must be quiet enough that 122 files can be rewritten without colliding with work in flight. Split first: this is not one trivial token."
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 5a75bcf1b115e6114d3335cdce79ab8788e72f7e
---

## detail

src/engine carries 6,871 comment lines and 1,394 of them are written in capitals for emphasis, counted with rg on 2026-09-02. Rewrite them in the register of doc/guidance/voice.md, file by file, keeping what the comment says and dropping the argument. Add a check to util/checks that counts capitals-for-emphasis lines in Go comments and fails above zero. Watch it go red on the tree before the rewrite.

## done when

- the capitals check seen red first
- it answers zero over src/engine

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

## evidence: the finding

NOT SMALL ENOUGH TO REVIEW WHOLE, AND NOT SAFE TONIGHT.

Measured through the index: 324 comment lines in src/engine carry no lowercase letter, over 122 files. The detail's 1,394 counts the continuation lines under those headlines.

122 files is most of the package and eight lanes are editing it now, so the rewrite would collide with work in flight. The token's own first criterion asks it to be split, and it should be, by area.

A check failing above zero turns the battery red for every other lane before the rewrite lands. So it goes in with the first slice rather than ahead of it.

ONE QUESTION FOR THE OWNER. The capitals headline opens comments across the engine, the checks and the guidance itself, and voice.md carries no rule against it. Erasing it in 122 files is a register decision, cheap to make and dear to undo.
- go test -C src/engine ./... green

