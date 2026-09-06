---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: same session gives verdict
# where the token stands. The process owns these values.
status: open
claimed_by: f5927132/reviewer-tallis-two
claimed_at: "2026-09-06T11:47:10Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - b2d97a9c16e0d9b800325402a97ddc83f685e3ba
---

## detail

The engine refuses the verdict to the actor that did the work step. It does not refuse it to another name in the same session on the same box, and today it handed one over.

wk-fa2dd32c33 was worked by f5927132/main and handed to f5927132/reviewer-tallis-two for the verdict. Both claims carry the same box id, f5927132, and its commit 47f3790 carries the session URL this reviewer's own attribution block names, session_0162npZgMteJidTd9RBKGZvP. So the work and the verdict are one session under two names, which is what reviewing.md rule 14 exists to stop: an evaluator recognises its own output and favours it.

The evidence to refuse on is already on the token. claimed_by is written box/actor, so the box is in hand at both steps and the engine compares only the half after the slash.

I declined the verdict on wk-fa2dd32c33 and released the claim rather than answer it.

## proposed action

Where the verdict step is handed out (src/engine/pull.go), compare the box half of claimed_by for the work step as well as the actor half, and refuse the hand-out when the box matches. Decide first whether one box with several honest lanes is meant to be allowed: if it is, the guard belongs on the session rather than the box, and the token should say which.

## done when

- a token whose work step was claimed by a box is not handed to that same box for its verdict, and the refusal says which box worked it
- a Go test in src/engine drives a work claim as box/one and a verdict pull as box/two, and fails if the token is handed out
- the refusal names what to do instead, another box or a wait, so the queue does not look empty

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

