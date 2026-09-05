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
status: done
# who did the work step, so the verdict is never theirs
author: fable-cloud
claimed_by: aeaf7bd9/fable-cloud
claimed_at: "2026-09-05T12:12:31Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 5ae39024b7d0f32ed9e89ff6504eda505e8b7a00
  - c627f405617c2ddad5dca2a73461ba3571c9ded8
  - 202c7082db6f46699dcb71c7718c080fc927a1c4
  - 12d4dcd46b1d785bf3d75e16b6794e5538007ab2
  - 321a41837e6a305fccad7694b2a5f07f3a56e9d0
  - d826cf71d19f0c51cc6df835c31611ea0d398f34
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - be0dfc361b27b21d47a66b05cf096692e01e539d
  - a4ea79825ea0d7a91f38b7255023369c12279d7b
  - 63f2954858bf8d593da5c449797a7ff3f4b1b5d7
  - d2cb27afcfcd9f871a2bf06666713d91920f78f4
  - 80a61101660825b40adfd9e0088f577623ae3639
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
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | the approach names the field, who writes it, the one sort in next, and that parked wins |  |
| [x] | every done-when line is decidable, and names the command where one decides it | four are decided by go test -run TestAnUrgentTokenGoesOutFirst, the fifth by the driven editor check |  |
| [x] | the change is small enough to review whole, or it is split first | 14 files and 346 lines, of which the test file is 146 |  |
| [x] | the basics it stands on exist, or are minted first | the field door, the queue and the generic editor were all here, so nothing was missing |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | the test was written first and watched red on a missing field |  |
| [x] | the change follows the approach on the token, or the token says why it departed | a flag, a person's ruling, one stable sort at the top of next, and parked still out of the queue |  |
| [x] | se test --on this token answered ok, and what it ran is named | TestAnUrgentTokenGoesOutFirst ok in 0.47s, and the driven editor check green over a tree with a current engine |  |
| [x] | the note says what changed and why, for a reader who was not here | the note section carries the three halves and says nothing clears the flag |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | a driven check reading whatever engine is running is wk-711bbd91ec |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | [[reviewing]] was read and applied | read first: one round, improvement over perfection, findings minted |  |
| [x] | every hunk of git diff began..ended was read, and any not read is named | all 14 files of 6cbecc0a read whole, none skipped. The rest of that span is other tokens |  |
| [x] | every criterion's command was run again, and what it said is named | set --by person wrote the flag and se find read it back, --by an agent was refused. TestAnUrgentTokenGoesOutFirst ok 0.45s. drive-editor ok 2.60s |  |
| [x] | every hunk improves the product, or a finding names the one that does not | yes, but for two work.base hunks answering no criterion: wk-ef7d0af942 |  |
| [x] | every finding is a trivial token naming this one, and their ids are here | wk-ef7d0af942. Also seen: a put-down never clears the flag, which the token settled |  |

## note

Urgent is a flag a person writes, and the queue reads it before the order it already had.

The engine half is five small pieces. The token carries the field, the note writes it only when it is on, the reader reads it back, field.go refuses it to an agent, and the row carries it so a view can filter.

The queue half is one function. next sorts what it walks with urgentFirst, which lifts the urgent ones and leaves the rest oldest first. It sits at the top, so all four passes read one rule.

The editor half is the view file. The work view names an urgent column and an urgent group, and the editor draws every column the engine does not lock. The control is the cell.

Nothing clears the flag. A put-down leaves it set.

## approach

A boolean field on the token, written by a person from the editor. field.go refuses a bucket to anyone who is not a person, and this is written the same way.

The queue reads it in next(), ahead of the oldest-unblocked-first order it already applies.

Nothing clears it. A put-down leaves it set and the same token comes back at the front. A person takes it off, the way a person put it on.

The ready_when check comes first, so a parked token stays parked whatever the flag says.

