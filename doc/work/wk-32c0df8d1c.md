---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: unbound still names tokens
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-ada
claimed_by: 542bcda8/reviewer-sibelius
claimed_at: "2026-09-04T18:48:25Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - c5b2d2b30c6e8d5d4204358d6d391c8d26dac436
  - 47b7b713d3ebb274f64d7c80f016c1b08f934139
  - fc1fb5c9f6de0a359025ea9964a75737ac62a536
  - 07614fa8dbbc098eb52f0dbe95d74e899a1265f8
  - 8d896ea9f028ddc295176c2e173899daf8de0e8d
  - d1eaad1e9890418811300c51549ff76045e5620a
  - b6f50c1eb06f8e06939ca216396eb2d5026a084d
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 040e25cc4b99132981ec08ab41dc5caf08f44d62
  - bdccbaf50aaad80e18af38fd8ff55ee86f90e27d
  - 54a9d4d934f94eeb45d293e70971b180eec1d58d
  - 3255b6503e5ede6940c31382609cbed39b903982
  - 4402d04e407fc63b1c5376a03c27287ba5ce4669
  - 863feb39f12002fd2b5c68278dcc1d2b8fcf2231
  - 438a612ac96aeb7964c064825df5927af4c46377
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: The change holds every criterion it could hold, and the one it could not is carried by wk-b750954b82. No findings.
---

## detail

Unbound is the queue off, and it currently takes the token requirement off with it. WriteNeedsAToken at src/engine/hook.go:1048 is applied only while the rung reads bound, so under unbound and under god a write and a run name no work.

The ruling is that unbound means one thing: this agent is not part of the queue. He picks what he works on, including a token nobody handed him. He still writes a token for it, and every write and every run still names one.

What that costs today is a record with holes in it. A session ran with every token left at noted and every submission empty, and a reader could not tell the queue being off from the process being followed badly. Both look the same on the work surface.

God is the other case and stays as it is. Every refusal is off there, the token requirement among them, because god is for a broken engine.

## proposed action

Apply the token requirement under unbound, and drop it only under god.

## done when

- a write under unbound with no token named is refused, and the refusal names the token door
- a run under unbound with no token named is refused
- a write under god with no token named is taken, and nothing is said about it
- the queue hands out no work under unbound, and a token the agent names is taken up
- a Go test in src/engine drives the three rungs against one write

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | Under the approach heading, before this take-up. It names the condition, the comment, and what does not move. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | No line named a command. Four of the five are decided by go test -C src/engine -run TestEveryRungButGodNamesItsToken. The fourth is not true of the engine, and wk-b750954b82 carries it. |  |
| [x] | the change is small enough to review whole, or it is split first | One condition, three sentences a person reads, one new test file, and three assertions flipped in an old one. |  |
| [x] | the basics it stands on exist, or are minted first | WriteNeedsAToken, the binding rungs and answerHook were all here. Nothing was minted for the change. |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token and testing read whole. The red came first, and is named below. |  |
| [x] | the change follows the approach on the token, or the token says why it departed | It follows it, and reaches one place it did not name. The tooltip in extension.ts carried the same clause. |  |
| [x] | se test --on this token answered ok, and what it ran is named | ok true, 26.8 seconds. TestEveryRungButGodNamesItsToken, red first at rungsnametokens_test.go:66, then ok. Three older binding tests ran with it. |  |
| [x] | the note says what changed and why, for a reader who was not here | Under the note heading. It names the condition, the three sentences a person reads, and what the tests hold. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | A token of its own, wk-b750954b82. The queue does hand out work under unbound, because the pull never reads the binding. |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | [[reviewing]] was read and applied | Read whole. Three candidates written, then cut. |  |
| [x] | every hunk of git diff began..ended was read, and any not read is named | All of this token's. Unread and not its own: swap.go, identity.go, claim.go, the package moves. |  |
| [x] | every criterion's command was run again, and what it said is named | TestEveryRungButGodNamesItsToken and three binding tests pass. Putting the condition back reddens line 68. Criteria one, two, three and five hold. The fourth does not, since pull never reads the binding. |  |
| [x] | every hunk improves the product, or a finding names the one that does not | Yes. The gate, three matching sentences, and tests asserting each door. |  |
| [x] | every finding is a trivial token naming this one, and their ids are here | None. The fourth criterion is carried by wk-b750954b82, open. |  |

## approach

The condition at src/engine/hook.go:1048 asks whether the rung is bound. It asks instead whether the rung is god, and refuses a write that names no token at every other rung.

The comment on Unbound at src/engine/unbound.go:43 loses the clause saying no token is needed to write or to run a command. That clause is the thing being ruled out.

Nothing else about unbound moves. The queue still stops choosing the work, and nobody is made to spawn. The record, the voice rules, the schema caps and the stale-write refusal stand as they do now.

The refusal an unbound agent meets is the one a bound agent meets, so no new message is written.

## note

src/engine/hook.go asks the token rule at every rung but god. The condition read bound and now reads not god. Nothing else in the gate moved.

Three places said the old rule in a person's words, and all three now say the new one. The comment on Unbound in src/engine/unbound.go, the sentence SetBinding hands the agent, and the status bar tooltip in src/extension/extension.ts.

src/engine/rungsnametokens_test.go drives one write at bound, unbound and god through answerHook, and a run at unbound beside it. Each case asserts the guard's own sentence rather than the word deny. Several guards deny, and one reading only that would pass on somebody else's refusal.

TestUnboundTakesTheQueueOffAndLeavesTheTreeGuarded held the old rule and now holds this one. Its voice-rule half gained a second assertion. The token rule refuses that call too, so a test reading only deny would prove nothing about the voice check.

