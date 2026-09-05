---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the retro reads broken
# where the token stands. The process owns these values.
status: open
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - d23edd4d39efed5fc12ca857f2bf35a7076b2c71
  - 8e015a4477dd18cdb83569877a3e12338c444947
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - c4890e6faa6f11cdeb43886456e3f602d3936166
  - 155591b51f24dffa80b73bac60906991a27c837d
---

## detail

A broken claim is taken on the agent word and nothing looks at it afterwards. The blocked claim is judged from the engine own facts at two doors. broken is registered at src/engine/stop.go:55 with no judge and nothing downstream.

Judging it at the door was weighed and refused. An agent the guard refuses would then hold the evidence for escaping the guard, and an agent genuinely trapped would have no door at all. The tree blocks enough already.

So the reading moves to the retro, where a person is looking anyway. The material is there. A claim carries the session, the actor, the reason and the time, and the session log under .se/log carries an ok column per call. theLog in burndown.go already reads and de-duplicates it.

What the claim does not carry is the token the actor held and the call the engine last refused. The engine knows both without asking, so it stamps them rather than asking the agent for more prose.

failures.json is the wrong source. It holds the current consecutive run of one call hash per actor, and clearFailures wipes it on the next success. It answers whether a call is looping now, not whether anything broke.

## proposed action

Stamp a broken claim with what the engine already knows, and have the retro read every broken claim against the session log and say what happened. Refuse nothing.

## done when

- a broken claim carries the token the actor held and the last call the engine refused in that session
- the retro answer names every broken claim of the session, with that actor failed calls beside it
- a broken claim over a session whose log holds no failed call is named as that, and is granted anyway
- the stop door refuses no broken claim that it takes today
- a Go test in src/engine drives one claim with a failure behind it and one without

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

StopClaim in src/engine/stop.go gains two fields the engine fills at the claim. The token the actor held, read from the hold store. The last call it refused this session, read from the log. The agent is asked for nothing new.

The retro joins on session and actor. A claim names both, and the log rows carry both, so the join needs no index and no new file.

The answer says one of two things per claim. Either the log holds failed calls, and they are listed. Or it holds none, and the claim is named as one the record cannot corroborate. Both are reported and neither is refused.

failures.json is not read.

