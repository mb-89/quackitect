---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: verdict leaves status done
# where the token stands. The process owns these values.
status: open
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 75e56084321d35b4582d0d349e619411e6ca0703
---

## detail

A verdict is written onto the token, and the token stays at done. The verdict step should move it from done to closed. Instead the commit carrying the verdict text moves status from open to done. That is the do step's transition, not the verdict's. So a reviewed token never reaches closed, and the queue keeps offering it as work.

The measurement is four tokens, every one verdicted and every one left at done. They are wk-b75b6ebff3, wk-30821724fc, wk-6d74c93848 and wk-7783c03017. Their verdicts are committed as c3b886d6, 0a4d5d97, 8f1c4276 and 0eda7b14. Each verdict minted findings that exist as real tokens, several already worked and archived. So the review happened, and only the state is wrong.

Two of the four were closed by hand afterwards. The other two remain as evidence.

## proposed action

Make the verdict step write status closed with its disposition. Add a check that no token carrying verdict evidence is left at done.

## approach

The transition belongs to the activity, not to the hand that writes the text. The verdict activity says it goes to closed, and the code applies the do step's transition instead. So the fix is at the seam that reads the activity and writes the state.

One test drives it. A token at done takes a verdict submission, and the assertion is status closed with the disposition the submission carried. It is red before the change, saying done where closed is wanted.

The check is the other half, because the four tokens measured here are already wrong on disk. It names a token whose step 3 evidence is filled while its status reads done. It is red on the two that were not closed by hand.

Those two are then closed properly rather than edited, so the check goes green through the door it guards.

## done when

- a submitted verdict leaves the token at closed, decided by a Go test in src/engine
- the same test fails before the change, so the defect is caught
- a check reports any token whose step 3 evidence is filled while status is done
- the check answers clean over doc/work after the change

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
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

