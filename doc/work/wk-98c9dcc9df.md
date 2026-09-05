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
claimed_by: 547b9365/worker-holly
claimed_at: "2026-09-05T19:36:16Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 0ca3509c38c7d8805431c588bfbe5dac3b23cdf6
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

