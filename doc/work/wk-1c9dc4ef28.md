---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: stops hand work back
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-varese
claimed_at: "2026-09-05T14:28:55Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 8a4035249805dd9d745118bd13c10b3724210f32
  - f68049b3a3f5d35efd361f2a94b2f47480058ee3
  - 05adfb8a10366d136a5f5c1967b76bc2c7fc2c06
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 99d4735e87855e2241e047399d3e06dbc3a4a287
  - 2063fbaba324f1bdcd6f0fd3b66a5b58c3af13bd
---

## detail

A subagent that ends keeps the token it held. Nine tokens are parked behind agents that no longer exist, and the panel draws a row for each, because a row is drawn for whoever holds a token.

AgentGone at src/engine/hook.go:597 writes down that the identity went and touches no token. The sanctioned-stop refusal is the main agent alone, so a helper stop is recorded and never refused. A helper that runs out of turns, is interrupted, or ends takes the work with it.

The ruling has three parts.

- a helper stop is refused while it holds an open token, so it finishes or puts the work down deliberately.
- an agent marked gone puts down what it holds, as the fallback for one that dies anyway.
- what is parked today is released.

The trivial and note processes have no reviewer step, so a worker gives its token back at submission. Nothing collects the ones that never got there.

## proposed action

Refuse a SubagentStop while that agent holds an open token, have AgentGone put down what it held, and release what is parked today.

## done when

- a SubagentStop from an agent holding an open token is refused, and the refusal names the token id
- the same stop is granted once the token is submitted or put down
- the refusal relents the way a refused stop already does, so a wedged helper is not trapped
- AgentGone leaves no open token held by that agent names, proved by a Go test in src/engine
- no token in this tree is held by an agent the register says is gone

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | proposed action names three parts: refuse the stop, put down what a gone agent held, release what is parked. A reader can disagree with refusing a helper at all. | proposed action |
| [x] | every done-when line is decidable, and names the command where one decides it | Lines 1 to 4 are decided by Go tests in src/engine. Line 5 is decided by se ask over the tokens against the register. | done when |
| [x] | the change is small enough to review whole, or it is split first | One file, goneputsdown.go, and its call sites in hook.go and main.go. | — |
| [x] | the basics it stands on exist, or are minted first | countRefusedStop and AgentGone both exist. Line 3 has no check yet, and that is what is left. | src/engine/guards.go:239 |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | The check was written first and watched red on an undefined function. | the red run |
| [x] | the change follows the approach on the token, or the token says why it departed | An earlier hand built lines 1, 2, 4 and 5. Only line 3 had no check, and that is what this adds. | goneputsdown.go |
| [x] | se test --on this token answered ok, and what it ran is named | se test will not run here: this token's began is not an object on this box. The four criteria tests pass | goneputsdown_test.go |
| [x] | the note says what changed and why, for a reader who was not here | AHelperStopStillRefused holds the relent, and hook.go asks it. Both halves read one function, so a check cannot drift. | goneputsdown.go |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The red ghost tests are wk-99a064bae7. | wk-99a064bae7 |

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

Two doors and one sweep.

The stop hook gains the refusal. A SubagentStop from an agent holding an open token is refused, and the refusal names the token and the two ways out. The relenting a refused stop already has applies here, so a helper that cannot finish is not trapped.

AgentGone at hook.go:597 gains the put-down. It already knows the identity is gone, so it walks that agent names and puts down what each one holds. That is the fallback for a helper that dies without a stop.

Then the nine parked today are released once, by the same call the fallback uses.

## note

The work here is an earlier hand's. This box was handed the step with one line open and finished the checking.

se test will not run on this token here. Every began it carries was written on another box, and none of those objects is in this repo, so the delta cannot be computed. It answers "git diff: fatal: bad object 05adfb8a".

So the four tests the criteria name were run directly, over a copy of HEAD. TestAnAgentThatGoesPutsDownItsWork, TestATurnsEndPutsItsHelpersWorkDown, TestAHelperCannotStopHoldingOpenWork and TestAHelperStopRelentsAfterEnoughRefusals all pass. The three that were red on the claim gate are green now, so wk-99a064bae7 no longer holds this up.

The fifth line is not a test. It was read off holds.json against arrivals.json: eleven holds, every actor in the register, and no token file carries a holder.

