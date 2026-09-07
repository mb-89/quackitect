---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: take the group branch
# where the token stands. The process owns these values.
status: open
claimed_by: 542bcda8/main
claimed_at: "2026-09-07T11:50:46Z"
---

## detail

A branch named group/x narrows the queue to bucket: x, and nothing in the tree makes such a branch. Somebody has to type a checkout by hand, which is the manual step the design exists to remove. The shape is already here and trusted. boxbranch.go takes box/&lt;id&gt; at start, makes the branch when it is absent, leaves a detached head alone, and is never fatal. A group branch is that same function with a different name and a different trigger. Without it the reading half is a rule nobody can reach: a box narrows itself correctly only if a person remembered to cut the branch first.

## proposed action

TakeTheGroupBranch puts this tree on group/&lt;bucket&gt; and answers what it did, in the shape TakeTheBoxBranch already answers.

It makes the branch off where the tree stands when the ref is absent, and takes the existing one when it is there. A detached head is left alone and says so, because that is somebody's bisect. Nothing about it is fatal.

The engine reaches it by a flag naming the bucket. The branch is the instruction from that moment, so the next pull is narrowed with nothing typed and the pull says the branch did it.

## done when

- naming a bucket puts the tree on group/that-bucket, decided by: a Go test in src/engine
- an existing group branch is taken rather than remade, decided by: the same Go test
- a detached head is left where it stands and the answer says so, decided by: the same Go test
- the queue is narrowed to that bucket straight after, decided by: the same Go test

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

