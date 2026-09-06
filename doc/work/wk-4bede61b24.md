---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: wake merge reverts commits
# where the token stands. The process owns these values.
status: open
---

## detail

A MERGE COMMIT MADE FROM THE SHARED WORKING TREE SILENTLY REVERTS WORK THAT IS ALREADY ON THE BRANCH.

Measured here in September 2026 on doc/work/wk-963dbf6898.md.

Commit 6b93bad3 trimmed that token and answered its checklists. The merge fa7cde25, authored by quackitect with the message "Merge branch v4 of github into HEAD", has 6b93bad3 as one parent and e3614b17 as the other. Checked with git log, e3614b17 does not touch this file at all. The last commit touching it on that side is b342b6d2, which is the common base.

So the merge had one change and no rival, and should have taken 6b93bad3 whole. Instead the merged content matches neither parent. The merge commit carried a stale copy out of the shared working tree, the tree many agents share, which wk-c69f2dabc7 measures as behind.

WHAT THE REVERT COST. The receipts naming pullverb.go and shellsubmits_test.go, the battery output, and the trim. The restored older draft ran to 233 words in step 1 against a bound of 200, and a note over a bound cannot be saved at all. The engine could not write the token to release a dead hold, so the queue asked every worker who pulled to rule on a hold that had nowhere to go.

Restored by acfbd35d. The strand itself is wk-7a498f6a2b.

This is not one file. Any merge run from that tree can revert any landed commit, and nothing announces it.

## proposed action

Find what runs that merge, and stop it committing files it was not merging. A merge from a dirty shared tree should refuse, or stash and restore, rather than fold uncommitted content into a merge commit.

## done when

- a merge run over the shared tree while it is dirty either refuses or leaves the dirty files out of the merge commit, decided by making a tracked file dirty and merging
- the merged content of a file changed on one side only equals that side, decided by git diff between the merge commit and that parent over the file
- both cases are a test that goes red first against the door that runs the wake merge
- the branch is checked for other files fa7cde25 and its siblings reverted, and what is found is named here

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

