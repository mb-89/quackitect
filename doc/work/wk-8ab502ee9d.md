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
status: open
claimed_by: aeaf7bd9/worker-dutilleux
claimed_at: "2026-09-05T15:54:43Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - a7641c405a498335fa88c2ef33380181b7901976
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
| [x] | the ask is small enough to review whole, or it is split first | three corrections to one table. It is not too large, it is stalled: the table is not in the tree | read whole |
| [x] | every done-when line is decidable, and names the command where one decides it | the third names a find over util/cage and is decidable. The first two name the note's table, which is not here, so neither can be decided | se find --words 218e541ec2 |
| [x] | the basics it stands on exist, or are minted first | they do not. wk-218e541ec2 is in no note under doc/work or .se/work, no row of archive.jsonl, no commit on any branch and no archive tag. Minted as wk-5e31bc7615 | four counts, all zero |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token, in the prompt | — |
| [x] | one test was written first and seen red for the reason expected | none was written. What it would read is a table that is in no file here, so it would assert against nothing and pass or fail by accident | nothing to drive |
| [x] | the same test was seen green after the change, and named | no change was made to the tree, so nothing went green. The battery was left as it stood | — |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | empty apart from this note and the successor. Inventing the three marks would put numbers in the table that nobody measured | git status |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | wk-5e31bc7615 carries the whole ask, and adds the cage comment citing an id that resolves to nothing | — |

