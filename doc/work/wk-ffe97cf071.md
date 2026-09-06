---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: stop flag reads nowhere
# where the token stands. The process owns these values.
status: open
---

## detail

A finding on wk-dffbf05720, relenting needs a claim.

Its approach says the valve becomes two conditions read together. "The harness says this stop was already refused, and an se_stop claim stands on the record since the last pull. Either alone refuses."

Only the second half was built. A standing claim grants the stop in decideStop, and nothing in the engine reads the first half. se find over src/engine/*.go for StopHookActive gives seven hits: the field on hookIn at src/engine/hook.go:72, and six test payloads setting it. No decision reads it.

So the field is decoded out of every stop payload and thrown away. That is the dead weight a review asks about, and it is here because the code that used to read it went out with the count.

The code is the better half of the disagreement. A claim alone is a stricter rule than a claim plus a flag the harness sets for its own reasons. The token's own test says as much: stop_hook_active is not a claim. What is wrong is the record. Step 2 ticks "the change follows the approach" and says "It follows it", when half the approach was dropped on purpose and no line says why.

## proposed action

Take StopHookActive off hookIn in src/engine/hook.go, and off the test payloads that set it. Then write one line on doc/work/wk-dffbf05720.md saying the flag half was dropped, and that a claim alone is the stricter rule.

## done when

- StopHookActive is gone from src/engine, decided by: se find --regex StopHookActive over src/engine answering no hits
- the engine still refuses an unclaimed stop however often it is retried, decided by: se test naming TestAStopWithNoClaimIsRefusedHoweverOftenItIsAsked and TestAClaimGrantsOneStopAndThePullSpendsIt
- doc/work/wk-dffbf05720.md says the flag half was dropped and why, decided by: reading its step 2 against its approach

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

