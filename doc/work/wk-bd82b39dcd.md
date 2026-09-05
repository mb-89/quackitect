---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: staffing guard stalls main
# where the token stands. The process owns these values.
status: open
---

## detail

The staffing guard refuses every call of the main agent, se_apply and se_run included, until the number of workers and reviewers it wants have pulled. Its count is what has pulled in this engine's lifetime and is still here. So the main agent's own work stops whenever the count drops, and the count drops all the time.

Measured on 2026-09-05, session 20260905-113031 and the two before it, on one cloud box. Three times in one hour the guard refused the main agent mid-token: once at the start, once after an engine restart forgot the reviewers that were already spawned and still working, and once after the workers finished their tokens and the queue answered them wait. Each time the remedy was to spawn agents whose only purpose was to be counted, and each spawn costs a model session. Between the refusal and the spawned agent's first pull, the main agent, holding a claimed token with a change half applied, can write nothing.

The guard's aim is right: 97 open tokens want more hands than one. Its door is wrong: it closes the main agent's own work rather than asking for hands beside it.

## proposed action

The guard says what it wants and lets the call through. It refuses nothing the main agent does on a token it holds, and it asks for hands as additional context on the answer, once per shortfall rather than on every call. A restart reads the register of agents that are still alive rather than starting the count at zero. A test drives a held token's se_apply through the guard with zero helpers registered and asserts the write lands and the answer carries the ask.

## done when

- a call on a token the main agent holds is not refused for want of helpers, decided by: go test -C src/engine -run 'StaffingAsksAndLetsThrough' ./... answers ok
- the ask for hands is on the answer once per shortfall and not on every call, decided by: the same test counting the asks over five calls
- sh util/checks/battery.sh reports no new failure against the run before the change

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

