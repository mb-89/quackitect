---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: done keeps worker claim
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/reviewer-lutoslawski
claimed_at: "2026-09-05T16:11:16Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - d4e3ae5ae6eeb653fd3d0d7525c2c9c0c43741c5
---

## detail

Submitting the do step moves a token to done, and the verdict is owed to a reviewer who is never the author. The claim does not move with it. The worker's claim stands until the three hour window runs out, so no reviewer can take the token, and se claim answers "it is claimed by" with the worker's own name.

Measured here on 2026-09-05 at 16:08, working the verdict queue as reviewer-lutoslawski. Four tokens stood at done and every one was refused: wk-40abb881a7 to worker-messiaen, wk-4cb6df2b99 and wk-4f8e7e7ebe to worker-sibelius, wk-a46c014566 to another box. Three of the four are on this box, so this is not the cloud push problem.

THE DAMAGE. A verdict is the one step that gives a change a second pair of eyes, and it cannot start for three hours after the work is submitted. A reviewer pulling in that window is told to wait while done tokens pile up, so the queue reads empty when it is full.

wk-59000ced9f names the neighbouring fault, that the author's own pull is handed its done token back. Its proposed action says the submission puts the token down, but no done-when line there asks for the claim to be released, so this half can pass unfixed.

## proposed action

A submission that moves a token out of the step its claimant works releases that claim, the way a close does. The next reviewer then claims it in the ordinary way.

## done when

- submitting the do step leaves the token unclaimed, decided by: a Go test in src/engine submits as one actor and reads the claims record with no claim on that id
- a second actor then claims the done token and is not refused, decided by: the same test claims it as a reviewer and reads taken rather than refused
- both assertions are seen red before the change

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

