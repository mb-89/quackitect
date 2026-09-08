---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: commit the index safely
# where the token stands. The process owns these values.
status: open
---

## detail

A change that exists only in the index cannot be committed, so a file mode cannot be recorded from a desk on Windows. git commit with paths is --only, and it takes those paths from the working tree. Windows carries no executable bit, so the working tree reads 644 whatever the index holds, and the staged 755 is discarded on every attempt. A pathless commit would carry it, and ACommitCarriesStrangers refuses one outright because the index is shared and may hold another hand's file. The refusal is right about the danger and wrong about the shape: it refuses every pathless commit rather than the ones that would carry a stranger. Measured in September 2026: battery.sh, install.sh, land.sh, cherrypush.sh and benchmark.sh all stand 100755 in the index and 100644 at HEAD, and no sequence of commands from this box can land them. A cloud box on Linux is answered permission denied when it invokes any of them by path.

## proposed action

Narrow the refusal to what it is about. A pathless commit is refused when the index holds a path the record does not attribute to the token in hand, and allowed when it holds nothing else. AStageCarriesStrangers already asks exactly that question, so the test exists and only wants calling from the commit door. ACommitCarriesStrangers takes the token id to ask it.

## approach

ACommitCarriesStrangers gains the token id, the way AStageCarriesStrangers already takes it. Its pathless branch asks whether the staged set holds a stranger rather than refusing on shape alone. The refusal keeps its wording where a stranger is there, and names which path made it refuse. Eight call sites and tests take the extra argument. The merge exception stays as it is.

## done when

- A pathless git commit is refused when the index holds a path this token did not write, and the refusal names that path
- A pathless git commit goes through when every staged path is one the record attributes to this token
- The five scripts under src/scripts stand 100755 at HEAD, which git ls-tree HEAD answers
- A merge commit is still concluded by git merge --continue while MERGE_HEAD stands

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

