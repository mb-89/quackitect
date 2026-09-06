---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: AskToStop reaches nothing
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
---

## detail

A cleanup revealed by wk-c5bbfb9512, which took the binding out of AskToStop.

AskToStop is registered as a stop check and runs at the tail of decideStop, below every rung. It refuses when the actor holds work the queue would still hand it.

EVERY PATH RETURNS ABOVE IT NOW. God returns at the god rung. Unbound returns at the unbound rung. A standing claim is granted at once, on the owner ruling that a valid claim stops. An unclaimed stop is refused by the claim rung, which is also above the checks. So there is no state in which AskToStop decides anything.

WHY THAT MATTERS. A check nothing reaches cannot redden on the engine behaviour, and a test that drives it directly reads as cover it is not. The same shape wk-c5bbfb9512 has just removed from inside it.

MEASURED, September 2026, by reading src/engine/hook.go decideStop against src/engine/pull.go.

## proposed action

Read decideStop rung by rung and decide whether any state reaches askTheAuthority. If none does, delete AskToStop and its registration, and say in decideStop that the rungs are the whole judgement. If one does, name it in a test.

## done when

- either AskToStop is gone with its RegisterStopCheck line, or a test drives decideStop into it and reddens when it is removed
- the stop tests stay green: se test naming TestAValidClaimStopsAtOnce, TestGodSilencesTheStopHook and TestAStopWithNoClaimIsRefusedHoweverOftenItIsAsked

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

