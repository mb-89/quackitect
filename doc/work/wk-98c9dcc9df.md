---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: session end keeps holds
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-webern-two
claimed_at: "2026-09-05T21:27:32Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 675b321d9aad544773438a39baeebadb1e4783ef
---

## detail

A FINDING FROM THE VERDICT ON wk-1c9dc4ef28.

src/engine/evidence.go:404. AgentsGoneWith marks every agent of a session gone on SessionEnd and touches no token. The other two doors that mark an agent gone, HelpersGoneWith and AgentGone, call PutDownWhatTheyHeld first; this one was left out. A helper still alive when its session ends, with no turn end before it, keeps its token: the queue counts that work as in hand and hands it to nobody until the next engine start, when SweepWorkHeldByTheGone catches it. That is the class wk-1c9dc4ef28 was written to shut, arriving through the third door.

The session's own row must stay held across a restart on purpose, so the put-down is for the helpers of the session only, which is the filter HelpersGoneWith already uses: a.Session == session, id != session, a.Kind != "session".

## proposed action

In AgentsGoneWith, before the register is changed, call PutDownWhatTheyHeld for every agent of the session whose Kind is not session, using the same filter HelpersGoneWith uses. The session's own hold is left alone.

## done when

- a Go test in src/engine registers a helper of session s-1 holding a token, calls AgentsGoneWith(r, "s-1"), and asserts the token is no longer held; that test is watched red before the change
- the same test asserts a token held by the session's own name is still held after AgentsGoneWith
- TestAnAgentThatGoesPutsDownItsWork and TestATurnsEndPutsItsHelpersWorkDown still pass

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | A helper's token comes back when its session ends, rather than waiting for the next engine start to sweep it. | the detail |
| [x] | what breaks if it is never done, and not only that it stays undone | Work sits behind a helper that no longer exists, the queue counts it as in hand, and hands it to nobody. | the detail |
| [x] | the ask is small enough to review whole, or it is split first | Three lines in one function, and one test beside two like it. | git diff HEAD --stat |
| [x] | every done-when line is decidable, and names the command where one decides it | All three lines are Go tests in goneputsdown_test.go. | go test -run TestASessionsEndPutsItsHelpersWorkDown |
| [x] | the basics it stands on exist, or are minted first | PutDownWhatTheyHeld and the filter both stand in HelpersGoneWith, so nothing was minted. | src/engine/evidence.go |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read whole. Rule 12 drove red first. Rule 13 drove both halves, the helper and the session's own hold. | doc/guidance/work-token.md |
| [x] | one test was written first and seen red for the reason expected | TestASessionsEndPutsItsHelpersWorkDown failed saying the session ended and the token is still held by worker-ended. | /tmp/enggone |
| [x] | the same test was seen green after the change, and named | It passes, with TestAnAgentThatGoesPutsDownItsWork and TestATurnsEndPutsItsHelpersWorkDown, in 6.1s. | /tmp/enggone |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Two files. AgentsGoneWith puts the helpers' work down first, and the test is new. | git diff HEAD |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The filter naming a helper of a session is written twice now, here and in HelpersGoneWith. A third door would want it named once. | src/engine/evidence.go |

