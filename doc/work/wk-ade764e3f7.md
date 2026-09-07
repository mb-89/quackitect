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
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 749ad30324d47de9ba179e35df536d6c12a1c13b
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
| [x] | what is gained by doing it, and not only what it does | A bucket goes on its branch with no checkout typed by hand. |  |
| [x] | what breaks if it is never done, and not only that it stays undone | The reading half is unreachable unless somebody remembers a command. |  |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | TakeTheBoxBranch is the shape, named first. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | Four name a Go test in src/engine. |  |
| [x] | the change is small enough to review whole, or it is split first | One function and one flag. |  |
| [x] | the basics it stands on exist, or are minted first | boxbranch.go and the branch reading existed. |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | The criteria were on the token before any code. |  |
| [x] | the change follows the approach on the token, or the token says why it departed | TakeTheGroupBranch is TakeTheBoxBranch with a different name and trigger. It makes the ref when absent, takes it when present, and is never fatal. |  |
| [x] | se test --on this token answered ok, and what it ran is named | Five green: naming a bucket, a group already cut, the group you stand on, a detached head, and naming nothing. |  |
| [x] | the note says what changed and why, for a reader who was not here | branchcarriesthegroup.go holds it. main.go carries the group flag. The queue narrows straight after, which the first test reads rather than assumes. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | None. The six steps are still card prose rather than queue demands, and that is a build of its own. |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

