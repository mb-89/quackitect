---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: hook wake takes context
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-birch
claimed_by: 547b9365/worker-birch
claimed_at: "2026-09-05T19:13:03Z"
# the token this is a part of. It cannot close while this is open
parent: [[wk-697f9876cf]]
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 114a5604cfd8c61ea252b45327ee8eaba1a46b92
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 8a5e4b68e05eb8884fda9438fbeda661ed3be9d6
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

ensureEngine STARTS A PROCESS AND TAKES NO CONTEXT.

wk-697f9876cf asks that every spawn take the context that owns it. ensureEngine is the one spawn left untouched. It starts the engine and then polls for it in a loop of its own, sleeping fifty milliseconds at a time until a budget runs out, and nothing can end that wait.

Its two callers are in src/engine/hook.go: the wake path in runHook, and the SessionStart case in answerHook. Neither has a context to give it, so the parameter cannot be added without giving runHook and answerHook one first. answerHook is called from twenty-seven places, twenty-two of them tests, so this is a wide mechanical change and a narrow behavioural one.

That is why it is not in wk-697f9876cf's change. Its own diff is nearly all call sites, and it wants to be read as that rather than mixed into a change about servers.

The context a command hook owns begins in main, where the engine's already does.

## proposed action

runHook takes the context main makes, answerHook takes one from its caller, and ensureEngine takes it as its first parameter. Its wait loop selects on the context rather than only on the budget.

## done when

- ensureEngine takes a context as its first parameter, decided by: se find --regex 'func ensureEngine' answers a signature naming context.Context first
- a cancelled context ends the wait for an engine that never reports ready, decided by: a test in src/engine cancels and sees ensureEngine come back before its budget

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one parameter down one path, and the rest is call sites |  |
| [x] | every done-when line is decidable, and names the command where one decides it | the find for the first, se test for the second, and both were run |  |
| [x] | the basics it stands on exist, or are minted first | main already owns a context, and this is where the hook command's begins |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | read, and the test seen red before the loop was changed |  |
| [x] | one test was written first and seen red for the reason expected | TestACancelledContextEndsTheWaitForAnEngine failed: the wake waited 5.543s with its context already cancelled, and the budget is 5s |  |
| [x] | the same test was seen green after the change, and named | se test on this token ran 8, all ok, among them that one, TestTheRegisterFollowsAgentsInAndOut and TestTwoSessionsAreTwoActors. se find on func ensureEngine answers a signature naming context.Context first |  |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | began 114a5604 is in this clone, and the delta is guards.go, hook.go, hookserve.go and main.go, beside the call sites in twelve test files |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | the hook command's context begins in main beside the engine's, so no second context.Background arrived with this |  |

