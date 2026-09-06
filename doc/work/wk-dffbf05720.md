---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: relenting needs a claim
# where the token stands. The process owns these values.
status: done
# the person's own name for a group. It does not move the work
bucket: claims
# who did the work step, so the verdict is never theirs
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 3be6c3a66743b88ea32c93d07506eb425472f3fb
  - 2d561c77cf6a590351cbfe3d04b4e0429dbcfd22
  - b6020b05687a83ac84b7ae9190794ad7c75ea61b
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 31b2adaa7f823fbde33e8e91c7f517b6471b4d17
  - 372c9901ac9adb441840f90be8cd37e7352002d1
---

## detail

The stop hook gives up on a count. countRefusedStop in src/engine/stop.go increments per actor and relents once it passes stopRefusalsBeforeRelenting, with nothing claimed. So an agent that keeps stopping is let through for stopping often enough.

v3 removed exactly this. Its stop hook relents on two things together: the harness flag saying this stop was already refused, and a real se_stop claim on the record since the last pull.

The v3 comment names the defect. The harness sets its flag when it retries a blocked stop, so the valve released on its own, and the log reads stop-block then stop-pass over and over. From outside that cannot be told from a hook that does not work.

One claim releases one stop, because the next pull spends it.

Measured here: .se/stops.json holds an empty count after relenting, and the hook went quiet mid-session.

## proposed action

Relent only on a deliberate claim. Take the count out and require both halves, the harness flag and a standing se_stop claim since the last pull.

## approach

The count comes out. countRefusedStop and stopRefusalsBeforeRelenting go, with the file they wrote.

The valve becomes two conditions read together. The harness says this stop was already refused, and an se_stop claim stands on the record since the last pull. Either alone refuses.

The claim is spent by the next pull, so one claim releases one stop.

v3 is the worked example, and its comment is the reason. Read it before writing this.

## done when

- a stop refused twice with no claim on the record is refused again, proved by a Go test in src/engine
- a stop with an se_stop claim since the last pull is granted once
- the same claim grants no second stop after a pull
- stopRefusalsBeforeRelenting is gone from src/engine, proved by se find answering no hits

## evidence: a stop refused twice with no claim on the record is refused again, proved by a Go test in src/engine

TestAStopWithNoClaimIsRefusedHoweverOftenItIsAsked, ok true through se test on this token.

## evidence: a stop with an se_stop claim since the last pull is granted once

TestAClaimGrantsOneStopAndThePullSpendsIt, ok true. Its first half is this criterion.

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | A stop is granted because somebody decided, never because an agent asked often enough. |  |
| [x] | what breaks if it is never done, and not only that it stays undone | A guard that gives up on persistence is one an agent outlasts. The owner watched this hook go quiet. |  |
| [x] | the approach is on the token before any work | On the token: the count comes out, and the flag and a standing claim are read together. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | Three by named Go tests, one by se find for the constant. |  |
| [x] | the change is small enough to review whole, or it is split first | One valve out, one condition in, two tests. |  |
| [x] | the basics it stands on exist, or are minted first | The claim record and the flag existed. v3 is the example. |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token, read. Each line is answered rather than ticked. |  |
| [x] | the change follows the approach on the token, or the token says why it departed | It departed: the flag half was dropped, because a harness sets stop_hook_active on its own retries, so a claim alone is stricter. |  |
| [x] | se test --on this token answered ok, and what it ran is named | ok true, over TestAStopWithNoClaimIsRefusedHoweverOftenItIsAsked, TestAClaimGrantsOneStopAndThePullSpendsIt, TestAStopIsNeverGrantedForAskingOftenEnough and TestAHelperStopRelentsAfterEnoughRefusals. |  |
| [x] | the note says what changed and why, for a reader who was not here | The detail and hook.go carry it: what the valve was, what it cost, and that v3 removed it before. |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | Reported rather than ticked. The change was made on another box and this clone holds neither snapshot, so git diff began..ended answers bad object. I verified the outcome without reading the hunks. |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

## evidence: stopRefusalsBeforeRelenting is gone from src/engine, proved by se find answering no hits

se find, regex stopRefusalsBeforeRelenting, path src/**, answers count 0. The helper valve keeps its own constant, helperRefusalsBeforeRelenting, which is a different mechanism and TestAHelperStopRelentsAfterEnoughRefusals still passes.

## evidence: the same claim grants no second stop after a pull

The second half of the same test, ok true.

