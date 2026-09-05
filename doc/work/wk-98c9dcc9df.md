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
status: closed
# who did the work step, so the verdict is never theirs
author: worker-holly
claimed_by: 547b9365/worker-holly
claimed_at: "2026-09-05T19:36:16Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 0ca3509c38c7d8805431c588bfbe5dac3b23cdf6
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - b1aa461e7893bd62930e4b96c455ec902afc2659
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: "The put-down for a session's helpers is in AgentsGoneWith, and the session's own hold is left alone. The new test was watched red for the right reason, on this tree and on origin/v4, before it went green. Landed on origin/v4 as 0b796372d53962758da922f334ec08885a1636e9."
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
| [x] | the ask is small enough to review whole, or it is split first | One function, one guard clause, one test. 52 lines over two files. Nothing to split. | git diff began..tree |
| [x] | every done-when line is decidable, and names the command where one decides it | se test --on wk-98c9dcc9df decides all three. Lines 1 and 2 are the two arms of the new test, and line 3 names its two. The red run line 1 asks for is in step 2. | se test --on wk-98c9dcc9df |
| [x] | the basics it stands on exist, or are minted first | Nothing missing. PutDownWhatTheyHeld, LoadEvidence and the fixtures all existed. Only the test is new. | goneputsdown.go:25 |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Rules 11 and 12. The put-down and nothing beside it. Rule 12 is the red run below. | work-token |
| [x] | one test was written first and seen red for the reason expected | Written first. Failed: wk-8b203a7801 still held by worker-outlived once the session ended. Watched red again on origin/v4 against its own evidence.go. | goneputsdown_test.go:112 |
| [x] | the same test was seen green after the change, and named | Four ok: the new test 1.22s, AnAgentThatGoes 1.16s, ATurnsEnd 0.66s, AHelperCannotStop 3.56s. Green again on origin/v4 e314269f. | se test --on wk-98c9dcc9df |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | began 0ca3509c. Two files, 52 insertions, no deletions, nothing else. | commit 0b796372 |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | None. All three doors now put down before the register write. | src/engine/evidence.go |

