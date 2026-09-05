---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: checks read stale engines
# where the token stands. The process owns these values.
status: open
---

## detail

The checks that drive a page ask for their data through .bin/se, and that command proxies to whatever engine is running over the tree. So a check reads the behaviour of the engine that was started, not of the source it was built from.

Measured on this box. A column was added to the work view and a writable field to the engine. The check went red saying the column was locked, because the running engine was four minutes older than the tree and its ruling knew no such field. The same check, over a tree carrying a current engine, passed every assertion.

se --swap answers that the next engine is built and takes over when the calls in flight finish. It did not take over while another agent worked, so .bin/se stayed on the old build and every driven check kept reading it.

The Go lane already answers this: se test builds se.fresh and names it. The check lane does not.

## proposed action

Point the check lane at the fresh engine the Go lane builds, or make a driven check name the build that answered it, so a stale engine reads as a stale engine rather than as a defect in the change.

## done when

- a driven check names the engine build that answered it
- a check run over a tree whose engine is older than its source says so, and does not report the change as the fault
- one tree, one check, run before and after a swap, answers the same

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

