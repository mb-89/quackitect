---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: unmeasured is drawn silent
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-linden
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - bfa862cdaa7d0ae2c6a1ebc9db5965742a246a39
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - e8966ef14aab2a4101420511986cb0b8970289a8
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

Found reviewing wk-218e541ec2. The table's legend says a dash is silent, and then the prose takes three dashes back: the cli cells for SessionStart, StopFailure and ConfigChange are not silence, they were never measured, because the engine log opened after that session started. A table read by anyone but its author cannot tell those apart, and the rule the token itself wrote is that an event the table says is silent everywhere gets struck from the cage. SessionStart is what brings the engine up, so a mark that means unmeasured has to look different from one that means silent. The cage comment now shipped says every event below has arrived under the command line and under the editor, which the table does not support for those three. And the desktop Code tab, one of the three harnesses the approach named, has no column at all: the note says it never appears in the record, which is a harness never driven rather than a harness proven silent. Give the legend a third mark, use it in those cells, add the Code tab column carrying it, and make the cage comment say what was measured.

## done when

- the legend carries three marks, fires, silent and not measured, and no cell carries a dash the prose then takes back: the note's table
- the three cli cells and the desktop Code tab column carry the not measured mark
- the cage comment claims no more than the table shows: se find --words arrived --path util/cage/**

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | Five files: the table, the two cage comments, the projection of one, and the check that guards the citation. | 5 files |
| [x] | every done-when line is decidable, and names the command where one decides it | Lines one and two are read off util/cage/hooks-the-harness-fires.md. Line three is the find for arrived under util/cage, run as rg in the origin/v4 worktree because this clone lacks the change. | rg over util/cage |
| [x] | the basics it stands on exist, or are minted first | The table this token edits does not travel. It was on a note private to the box that ran the spike, so it is now util/cage/hooks-the-harness-fires.md, which every clone carries. | the table |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token read. Rule 11 kept it to the marks, the column and the comments. | work-token |
| [x] | one test was written first and seen red for the reason expected | It now resolves a path the comment names, and with the table held back it answered three FAIL, exit 1. | 3 FAIL |
| [x] | the same test was seen green after the change, and named | With the table in place: 8 ok, 0 failed, exit 0. gofmt, build and vet are clean. | 0 failed |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Not this clone, which is far behind origin/v4. It was made in a worktree of it and landed as 46d962c3. | 46d962c3 |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | In the change. PostCompact was struck on an unmeasured cell, so both comments now rest it on redundancy. | PostCompact |

