---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: urgent goes out first
# where the token stands. The process owns these values.
status: open
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 5ae39024b7d0f32ed9e89ff6504eda505e8b7a00
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - be0dfc361b27b21d47a66b05cf096692e01e539d
---

## detail

There is no way to say which token matters most. The queue orders the work, and a person watching it cannot put a finger on one and have it come next.

The ruling is a flag, and it survives a put-down.

- a flag: two urgent tokens are both urgent, and whoever pulls picks one.
- a rank: refused, because somebody then maintains the numbers.
- surviving a put-down: an agent that hands urgent work back is handed it again, because it is still the most urgent thing.

Today the only lever is naming a token by id. That takes it into one agent hands rather than telling the queue anything.

The panel already edits fields on a token, and the queue already sorts what it hands out. So this is a field and a sort key.

Parked beats urgent. A token carrying a ready_when is out of the worker queue, and a flag does not bring it back.

## proposed action

Add an urgent flag to the token, set from the work editor the way a bucket is set, and sort the queue on it first.

## done when

- a token marked urgent in the editor carries the field, read back by se find
- se pull hands out an urgent token before any older workable one, proved by a Go test in src/engine
- a put-down leaves the field set, and the next pull hands the same token out first
- an urgent token that carries a ready_when is handed out by no pull
- the work editor carries a control that sets it, and the panel check drives that control

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

## approach

A boolean field on the token, written by a person from the editor. field.go refuses a bucket to anyone who is not a person, and this is written the same way.

The queue reads it in next(), ahead of the oldest-unblocked-first order it already applies.

Nothing clears it. A put-down leaves it set and the same token comes back at the front. A person takes it off, the way a person put it on.

The ready_when check comes first, so a parked token stays parked whatever the flag says.

