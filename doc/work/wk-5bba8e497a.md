---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: ready_when leaves the queue
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-nancarrow
claimed_at: "2026-09-05T16:50:36Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 14ef55309aea9cde047526236c0f92535201dfc3
  - 95c482c1e199d45d88b8618a7852fad9f8bcde9c
  - be26f4b14a60472b5070bcfb93f772d9d2459af0
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - a2cadce1ed457d9618b7150b0e42b80a3d89efb0
  - 731fa879c7bc6aa38b304ad38bd80047c7c61cb7
---

## detail

An agent cannot decline a token. PutDown at src/engine/pull.go:783 clears the holder, and next() hands the same token back on the following pull. So a put-down is a no-op for the actor that made it.

The unheld loop in next() filters on ended, holder, workable-by and blocked. ReadyWhen reaches stopjudge.go and stateofplay.go, and nothing on the hand-out path.

Walked on wk-14f7bd73d6, a note whose ready_when names a conversation with a person. The pull answered it, the put-down returned zero, and the next pull answered the same id.

So an agent that obeys the process is livelocked, and one that wants progress writes a disposition it does not believe. That falls on the tokens that most need a person.

## proposed action

A token carrying a non-empty ready_when is not handed out by the queue.

## done when

- no pull hands out a token carrying a ready_when, in either role. Decided by: go test -C src/engine -run TestAParkedTokenLeavesTheQueueAndIsNamed -count=1 ./
- clearing that field puts the token back in the queue. Decided by the same test, which clears it and pulls again
- the state of play and se query name every parked token, with its condition. Decided by the same test, which reads both
- the three cases above are one Go test. Decided by: se find --regex 'func TestAParkedTokenLeavesTheQueueAndIsNamed'

## approach

ONE QUESTION, ASKED WHERE THE QUEUE CHOOSES. WaitsForAPerson(t) answers a sentence and not a yes, so whatever refuses can say what is waited on. The hand-out path asks it of every token it might hand out, for either role, and passes over the ones that answer.

THE FIELD IS THE WHOLE STATE. Nothing is written when a token is parked. Clearing ready_when puts it in the queue again on the next pull, so the put-down needs no change of its own.

AND WHOEVER PARKS ONE HAS TO FIND IT AGAIN. Both the state of play and se query name every token carrying the field, with its condition. A token nothing shows is one nobody un-parks.

needs_human rides the same question. A token marked as needing a person waits on the same thing, and two questions meaning one thing drift apart.

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | The approach section names one question, WaitsForAPerson, where it is asked, and what the field alone carries. A reader can disagree with the ruling that needs_human rides it too. | the approach section |
| [x] | every done-when line is decidable, and names the command where one decides it | All four now name their command. Three are decided by TestAParkedTokenLeavesTheQueueAndIsNamed, and the fourth by a search for that test. | go test -C src/engine -run TestAParkedTokenLeavesTheQueueAndIsNamed -count=1 ./ |
| [x] | the change is small enough to review whole, or it is split first | One filter on the hand-out path, and the two readers that name a parked token. It is not split. | — |
| [x] | the basics it stands on exist, or are minted first | ready_when is on the schema and reaches the token, and WaitsForAPerson already answers for needs_human. Nothing had to be minted. | src/engine/pull.go |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read. The change stood in the tree already, so this step wrote the approach and ran the commands again. | — |
| [x] | the change follows the approach on the token, or the token says why it departed | It does. WaitsForAPerson is asked on the hand-out path for either role, and both readers name a parked token. | src/engine/pull.go |
| [x] | se test --on this token answered ok, and what it ran is named | It answered ok true, having run src/engine/TestAParkedTokenLeavesTheQueueAndIsNamed. | se test --on wk-5bba8e497a |
| [x] | the note says what changed and why, for a reader who was not here | The detail says why. The approach says what: one question, the field as the whole state, and two readers. | the approach section |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | None beside it. needs_human was already answered by the same question. | — |

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

One condition beside the Blocked check in the unheld loop of next(), at src/engine/pull.go:613. A non-empty ready_when takes the token out of what the queue may hand out.

A condition an engine can check is depends_on, and the engine decides that one on its own. ready_when is the other kind by definition, so the queue has nothing to judge and passes over it.

Parked work then has one surface, which is the state of play, and it already lists the field. Whoever parks a token owns un-parking it, and wk-cfe766ba1c is the standing pass that asks.

