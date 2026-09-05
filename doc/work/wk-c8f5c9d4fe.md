---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: startEngine stops without context
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-elgar
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 443486a06ead26a482d0692753e60a9d2f84e29a
  - a3c1e4e58da1135e560727932542baeb4b5f9eb1
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 91940899121f218125e53b0bc035a989552d40de
  - 6a5bd833f8517d5284ef1e18411dc7dd330ee1d8
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: startEngine hands stopEngine the context it needs to read the engine off disk, and the check that could not see that call site now walks every one of them.
# what it became. They have to exist.
successors:
  - "[[wk-754581f5e8]]"
---

## detail

From the verdict on wk-391ac2bb07. That token's whole premise is that stopEngine() with no argument cannot find the engine, because a reattached window holds no child handle and a swap successor is a process no window ever held. src/extension/extension.ts:779, inside startEngine, is still that call: if (engine) stopEngine(). It is latent rather than live, because reattach at line 807 catches an engine that is already running and returns before a second is spawned, so today the window recovers. What is wrong is that the call cannot do what its name says. After a swap the handle names a dead pid, so stopEngine() kills nothing and sets the light to idle while the successor runs. The new check cannot see it: engine-stops-by-pid.mjs reads only the bodies of deactivate and stopEngine, so every other call site is invisible to it. Either hand this call the context, the way the watchdog at line 824 and the command at line 61 already do, or say in a comment why this one site does not want it. The check that catches the class walks every stopEngine call in extension.ts rather than the one body.

## done when

- no call to stopEngine in src/extension/extension.ts passes no argument, or the one that does carries a comment saying why
- util/checks/engine-stops-by-pid.mjs asserts over every stopEngine call site in extension.ts, not only the deactivate body
- se test --propose engine-stops-by-pid is green, and goes red when any call site is put back to stopEngine()

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one argument and a comment in extension.ts, one loop in the check | reviewed whole, not split |
| [x] | every done-when line is decidable, and names the command where one decides it | two commands decide three lines: se find --regex 'stopEngine\s*\(\s*\)' --path src/extension/*.ts, and se test --propose engine-stops-by-pid | both run, step 2 says what they answered |
| [x] | the basics it stands on exist, or are minted first | stopEngine already takes an optional context and reads whatIsRunning first, from wk-391ac2bb07 | nothing was missing |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token 12, red first. 4, match the identifier the source writes. 11, nothing beside the ask | — |
| [x] | one test was written first and seen red for the reason expected | widened before the fix: FAIL stops: extension.ts:779 hands stopEngine something to look the engine up with, quoting stopEngine() | red, the five older assertions still green |
| [x] | the same test was seen green after the change, and named | util/checks/engine-stops-by-pid, ok true, and again beside util/checks/liveness. Site 824 put back went red naming 828, then restored | green |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | src/extension/extension.ts and util/checks/engine-stops-by-pid.mjs | — |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | the check's header no longer claims it is read off the two bodies alone. And wk-754581f5e8, pulls are not liveness | — |

