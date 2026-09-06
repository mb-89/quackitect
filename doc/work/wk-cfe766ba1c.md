---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the retro reads ready_when
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: archive
# tokens that have to close before this can start
depends_on:
  - "[[wk-5bba8e497a]]"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 574210ea5444c3b07b474dc631726fa29fd50b15
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - dec2e18b93704f58063fc92be4d700687a7862b9
---

## detail

Parked work leaves the worker queue, so no agent walks past it again. A condition only a person judges needs a person to look at it again, and nothing in the tree asks anybody to.

Left alone, a parked token is work that disappears. The ready_when it carries was true when it was written, and the thing it waits for happens without anybody noticing.

The retro is the one moment a person reads the tree rather than a token. So it is where the parked work is put back in front of them, one condition at a time.

## proposed action

The retro reads every token carrying a ready_when and puts each condition to the person, so it is cleared or kept in one pass.

## approach

The retro walks the tokens, collects every non-empty ready_when, and puts each one to the person with its id and its condition.

It reads the tokens rather than a list of its own, so there is nothing to keep in step. A cleared condition comes off the token through the ordinary door, and the queue hands that token out on the next pull.

The retro is src/engine/retro.go, and this rides on the pass it already makes over the tree.

## done when

- the retro answer names every token carrying a non-empty ready_when, each with the condition it holds
- a retro over a tree holding no parked token says so and asks nothing
- a condition the person clears comes off the token, and the next pull hands that token out
- a Go test in src/engine drives the three cases

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

