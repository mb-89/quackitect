---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the sweep fails soft
# where the token stands. The process owns these values.
status: open
# tokens that have to close before this can start
depends_on:
  - "[[wk-808abd40a4]]"
  - "[[wk-162f92b1a2]]"
---

## detail

Tidying up is spread across places and some of it can only run on a desk. A cloud box cannot delete a ref, cannot push a tag, and cannot remove the branches a probe left behind. Today that means a cloud box leaves things and nobody knows what is owed. It also means a desk waits for a retro to tidy what it could have tidied at once. se archive --sweep exists and archives every token that has already closed. It is the right shape and the wrong scope: it is one job, and there are several, and it does not say what it could not do.

## proposed action

One command puts the tree right, and every part of it fails soft. It archives what has closed, prunes claims that have lapsed, and sweeps refs a box left behind. Anything it cannot do on this box is reported and skipped, and nothing it fails at blocks the caller. A desk runs it and the tree is tidy at once. A cloud box runs it, does what it can, and says what it could not. The retro calls the same command on start, so the tidying is one thing with one name rather than a list somebody maintains.

## done when

- one command archives, prunes claims and sweeps refs, and each part reports what it did or why it could not
- every part that fails leaves the caller unblocked and the tree usable, watched red first against a stubbed git that refuses every write
- the same command run twice changes nothing the second time
- the retro calls it on start, and its answer is in the retro's output rather than only in a log
- sh util/checks/battery.sh reports no new failure against the run before the change

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

