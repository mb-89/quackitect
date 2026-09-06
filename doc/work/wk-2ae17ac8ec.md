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
claimed_by: 7e7f0da1/main
claimed_at: "2026-09-06T19:27:12Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ea9ddfe97019863e4da1bace5bfb104993a7df73
---

## detail

A cleanup revealed by wk-c5bbfb9512, which took the binding out of AskToStop.

AskToStop is registered as a stop check and runs at the tail of decideStop, below every rung. It refuses when the actor holds work the queue would still hand it.

THAT PREMISE WAS WRONG, AND READING THE RUNGS SHOWED IT. This detail said no state reaches AskToStop. God, unbound, a standing claim and the session's first stop all return above the checks. So four rungs out of five do. The fifth does not.

THE LAST RUNG REFUSES AND THEN ASKS. It blocks the stop itself. Then it calls the authority for the words: what else this agent holds. So the refusal names the work rather than only the rule. AskToStop is that authority, and its text is the notice every unclaimed stop here has printed.

WHAT WAS ACTUALLY MISSING. Cover. The only test drove AskToStop directly, which proves the function and not that anything reaches it. Removing the registration reddened nothing.

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
| [x] | what is gained by doing it, and not only what it does | The path that reaches the registered check is covered, so removing the registration reddens. |  |
| [x] | what breaks if it is never done, and not only that it stays undone | The next hand reads four rungs returning early and deletes a live check. This hand nearly did. |  |
| [x] | the ask is small enough to review whole, or it is split first | One test and one helper. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | Both by se test on this token. |  |
| [x] | the basics it stands on exist, or are minted first | The rungs, the check and the stop helper all existed. |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token, read. Nothing was deleted, because the code answered the question the token asked. |  |
| [ ] | one test was written first and seen red for the reason expected | Not met. The token asked which branch was true first. It is the second, so a test was added rather than a deletion made. |  |
| [x] | the same test was seen green after the change, and named | se test on this token: TestTheRefusalNamesTheWorkInHand and TestUnboundTakesTheQueueOffEveryPathThatIsTheQueue, green. |  |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | therefusalnamesthework_test.go, and the helper in unboundqueue_test.go answers the text now. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | In the change. This token's own detail asserted what the code does not do, and it is corrected above. |  |

