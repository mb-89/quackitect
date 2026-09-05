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
status: done
# who did the work step, so the verdict is never theirs
author: worker-ash
claimed_by: 547b9365/reviewer-quince
claimed_at: "2026-09-05T16:00:55Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 14ef55309aea9cde047526236c0f92535201dfc3
  - 95c482c1e199d45d88b8618a7852fad9f8bcde9c
  - 183aff1793d77de8fd0cde8f400e818523a14ee3
  - f6a11533439b04c671a16de16e92fed0c8f277c6
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - a2cadce1ed457d9618b7150b0e42b80a3d89efb0
  - 731fa879c7bc6aa38b304ad38bd80047c7c61cb7
  - dd5ee66963e180f6cf4b8846e6cf14abec3be85e
---

## detail

An agent cannot decline a token. PutDown at src/engine/pull.go:783 clears the holder, and next() hands the same token back on the following pull. So a put-down is a no-op for the actor that made it.

The unheld loop in next() filters on ended, holder, workable-by and blocked. ReadyWhen reaches stopjudge.go and stateofplay.go, and nothing on the hand-out path.

Walked on wk-14f7bd73d6, a note whose ready_when names a conversation with a person. The pull answered it, the put-down returned zero, and the next pull answered the same id.

So an agent that obeys the process is livelocked, and one that wants progress writes a disposition it does not believe. That falls on the tokens that most need a person.

## proposed action

A token carrying a non-empty ready_when is not handed out by the queue.

## done when

- a token carrying a non-empty ready_when is handed out by no pull, in either role
- clearing that field puts the same token back in the queue on the next pull
- se query and the state of play name every token carrying a ready_when, with the condition it holds
- a Go test in src/engine drives the three cases

## evidence: green

se test --on this token answers ok on TestATokenWaitingOnAPersonIsNotHandedOut and TestTheStateOfPlayReadsOneScreen, and TestTheQueueIsStaffed answered ok beside them. go vet over src/engine is clean.

## evidence: red

The test now reads the state of play, and it failed twice: the screen carried neither the parked id nor the sentence it waits on. It printed 0 on a person, 1 parked and nothing under it. The clearing case in the same run passed, so that half was already right and now has a test.

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | One line, written by the minter before any work: a token carrying a ready_when is handed out by no pull. A reader can disagree by wanting a put-down that declines instead. | proposed action |
| [ ] | every done-when line is decidable, and names the command where one decides it | UNMET as written, and said rather than ticked. All four are decidable and none names its command. One decides them: se test --propose TestATokenWaitingOnAPersonIsNotHandedOut. | se test |
| [x] | the change is small enough to review whole, or it is split first | The filter was already here. What was left is one list on the screen and two cases in the test. | stateofplay.go |
| [x] | the basics it stands on exist, or are minted first | WaitsForAPerson, ReadyWhen on the token, and the state of play all exist. Nothing was minted. | token.go |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read. Red first, on the screen case. The two done-when lines already held were left alone. | work-token |
| [x] | the change follows the approach on the token, or the token says why it departed | It does. The filter it names was already in the tree. What was missing is the screen naming what is parked, and a test over two lines. | stateofplay.go |
| [x] | se test --on this token answered ok, and what it ran is named | ok. TestATokenWaitingOnAPersonIsNotHandedOut and TestTheStateOfPlayReadsOneScreen, with TestTheQueueIsStaffed beside them earlier. | se test |
| [x] | the note says what changed and why, for a reader who was not here | The one screen names each parked token and what it waits on. A count said something was parked and never what would un-park it. | stateofplay.go |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | None. The count became the list rather than sitting beside it. | — |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

## evidence: the change

src/engine/stateofplay.go: Parked, a count, becomes ParkedOn, one line per token naming its id, its title and what it waits on, sorted the way OnAPerson is. The screen prints them under the count it still shows. src/engine/parked_test.go: two cases added, the screen naming the parked token with its condition, and clearing ready_when putting that token back in the queue on the next pull.

## evidence: the query half

query.go declares ready_when as a column of the row a view filters and shows, so a view names it. No view in the tree draws parked work today. If a reviewer wants one shipped, that is a finding rather than something this change hid.

## evidence: what was already here

The hand-out filter this token asks for was in the tree when I took it. WaitsForAPerson is in token.go and next() calls it in both of its loops, so no pull in either role hands out a token carrying a ready_when. parked_test.go drove that, the ordinary work beside it, needs_human, and whitespace. Two done-when lines were driven by nothing: clearing the field, and the screen naming what is parked.

## approach

One condition beside the Blocked check in the unheld loop of next(), at src/engine/pull.go:613. A non-empty ready_when takes the token out of what the queue may hand out.

A condition an engine can check is depends_on, and the engine decides that one on its own. ready_when is the other kind by definition, so the queue has nothing to judge and passes over it.

Parked work then has one surface, which is the state of play, and it already lists the field. Whoever parks a token owns un-parking it, and wk-cfe766ba1c is the standing pass that asks.

