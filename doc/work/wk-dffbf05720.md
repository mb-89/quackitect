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
status: open
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 3be6c3a66743b88ea32c93d07506eb425472f3fb
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 31b2adaa7f823fbde33e8e91c7f517b6471b4d17
---

## detail

The stop hook gives up on a count. countRefusedStop in src/engine/stop.go increments per actor and relents once it passes stopRefusalsBeforeRelenting, with nothing claimed. So an agent that keeps stopping is let through for stopping often enough.

v3 removed exactly this. Its stop hook relents on two things together: the harness flag saying this stop was already refused, and a real se_stop claim on the record since the last pull.

The v3 comment names the defect. The harness sets its flag when it retries a blocked stop, so the valve released on its own, and the log reads stop-block then stop-pass over and over. From outside that cannot be told from a hook that does not work.

One claim releases one stop, because the next pull spends it.

Measured here: .se/stops.json holds an empty count after relenting, and the hook went quiet mid-session.

## proposed action

Relent only on a deliberate claim. Take the count out and require both halves, the harness flag and a standing se_stop claim since the last pull.

## done when

- a stop refused twice with no claim on the record is refused again, proved by a Go test in src/engine
- a stop with an se_stop claim since the last pull is granted once
- the same claim grants no second stop after a pull
- stopRefusalsBeforeRelenting is gone from src/engine, proved by se find answering no hits

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

## approach

The count comes out. countRefusedStop and stopRefusalsBeforeRelenting go, with the file they wrote.

The valve becomes two conditions read together. The harness says this stop was already refused, and an se_stop claim stands on the record since the last pull. Either alone refuses.

The claim is spent by the next pull, so one claim releases one stop.

v3 is the worked example, and its comment is the reason. Read it before writing this.

