---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: unbound rung strands AskToStop
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
---

## detail

A finding on wk-8863048da6, a valid claim stops.

TWO THINGS ABOUT AskToStop ARE NOW WRONG, both left by the unbound rung the same change added to decideStop.

DEAD WEIGHT. src/engine/pull.go's AskToStop opens with a carve-out: if Unleashed(r) it refuses nothing. Unleashed is Unbound or God. AskToStop's only caller is askTheAuthority, whose only caller is src/engine/hook.go at the tail of decideStop, and decideStop now returns at the god rung and again at the unbound rung, both above it. So the carve-out cannot be reached. src/engine/unboundqueue_test.go calls AskToStop directly and asserts it, so a test covers a branch no path takes and could never redden on the engine's behaviour.

A COMMENT THAT MISREADS ITS OWN MECHANISM. The unbound rung's header says the reasoning is "the same reasoning AskToStop was written on and never wired to". AskToStop is wired: pull.go's init registers it with RegisterStopCheck, and askTheAuthority runs it. src/engine/lesson_test.go already records it as registered in init and never called by name. A reader is told a live check is dead, and the next hand either deletes it or wires it twice.


## proposed action

Delete the Unleashed branch from AskToStop, and correct the sentence in decideStop that calls AskToStop unwired. If unboundqueue_test.go's stop-judge half asserts the deleted branch, it goes with it or moves to decideStop, where the rung is now read.

Do not simply reword the comment and keep the branch: two places implementing one rule is what the rung was added to end.

## done when

- AskToStop carries no branch for a rung its caller returns on first, decided by: reading src/engine/pull.go against src/engine/hook.go decideStop
- no comment says AskToStop is unwired, decided by: se find --regex 'never wired' over src
- the stop tests and the unbound queue test still pass, decided by: se test naming TestAValidClaimStopsAtOnce, TestGodSilencesTheStopHook and the unbound queue test

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | One place decides what unbound means for a stop, and the comment beside it is true. |  |
| [x] | what breaks if it is never done, and not only that it stays undone | A test asserts a branch no path takes, so it cannot redden on the engine, and the next hand reads a live check called dead. |  |
| [x] | the ask is small enough to review whole, or it is split first | One branch and one sentence, both in the wake of the same rung. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | Two by reading pull.go against decideStop and by se find, one by se test naming three tests. |  |
| [x] | the basics it stands on exist, or are minted first | The rung, the check and the test are all in the tree. |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

