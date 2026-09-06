---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: Staffing guard refuses everything
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: queue
---

## detail

The staffing guard refuses every call while fewer hands are here than the queue wants, including se_run and Bash. Unbound already has the shape wanted: the queue off and every other rule on. Measured on 2026-09-06: a cloud session asked to diagnose a push failure was refused Bash, then refused se_run, on a box whose work could not have been published. wanted() caps at parallel_agents, so a queue of 49 open tokens deadlocks a session identically to one of 96: the staleness is not the cause.

## proposed action

Narrow the staffing refusal to the two verbs that take new work, se_pull and se_claim. Every other call goes through while hands are short. The pressure to spawn stays on the act of taking work.

## approach

Written by main on 2026-09-06, while working wk-8797959d3c, which does not name this token. The hand that pulls this one is free to disagree with all of it.

The refusal moves from every call to the two verbs that take new work.

AStaffShortfall answers on se_pull and se_claim, and answers nothing on anything else. The wording it returns does not change, so a spawned agent reads the remedy it reads today.

A session short of hands can then read, run, test, apply and diagnose. What it cannot do is take more work, which is where the pressure to spawn belongs.

## done when

- A session short of hands is refused se_pull and is refused se_claim, and the refusal names spawning as the remedy as it does today.
- The same session, short of the same hands, is allowed se_run, se_apply, se_test, se_find and se_ask, and a test drives each of those five through the guard and sees it pass.
- A session short of hands that calls se_pull sees the same wording it sees today, so the remedy a spawned agent is given does not change.

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
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

