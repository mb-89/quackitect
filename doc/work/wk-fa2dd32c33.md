---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: Close eats the archive
# where the token stands. The process owns these values.
status: open
claimed_by: f5927132/main
claimed_at: "2026-09-06T11:06:33Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - b5e5666279a3625fce91fe8593a4964390fd9439
---

## detail

A close on a tree whose archive list is missing writes a list holding only what the local tags carry. Measured 2026-09-06: doc/work/archive.jsonl went from 377 rows to 1 after one close on a cloud box. Recovered from origin before it was pushed. archiveListRows reads a missing file as zero rows without an error. TheArchive then folds in the tags, and on a cloud box that is one tag, because a push to refs/tags is refused and nothing fetches them back. So the close writes one row over the whole archive. SweepClosed already guards this with an os.Stat and says why in its own comment. The close does not.

## proposed action

Give the close the guard the sweep already has. A list that is absent is not an empty archive, and a close over one writes nothing rather than what the tags alone carry.

## done when

- A close on a tree with no archive list and one local tag leaves the other rows alone, and a test drives it and reads them back.
- A close on a tree with a list appends to it as today, and a test drives it and reads the old rows and the new one.
- A close on a tree that has never had a list still records the token, and a test says what it wrote.

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the approach is on the token before any work, as an interface or a shape a reader can disagree with |  |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the change is small enough to review whole, or it is split first | — |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | the change follows the approach on the token, or the token says why it departed |  |  |
| [ ] | se test --on this token answered ok, and what it ran is named |  |  |
| [ ] | the note says what changed and why, for a reader who was not here |  |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

