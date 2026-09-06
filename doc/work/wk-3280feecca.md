---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: claim scopes to agent
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
claimed_by: 7e7f0da1/main
claimed_at: "2026-09-06T20:05:07Z"
# true when this waits for a person rather than an agent
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 0a657cbc0a661fc2258fe4cb5240b5341f199974
---

## detail

A claim is the box's and not the agent's. Three chapters say so and the suite encodes it. wk-3fe6395f91 asks the queue to pass over a token claimed by an actor other than the one pulling, which makes the claim the agent's instead.

MEASURED IN SEPTEMBER 2026, on a detached worktree at the branch tip. The pass in nextAmong, in src/engine/pull.go, asks whether a claim is ClaimedHere. Asking instead whether it is this actor's own is the whole behaviour change, one line.

WHAT IT COSTS. That line turns TestAPutDownTokenIsNotHandedPastItsClaim from red to green and turns twelve green tests red. Eight others were already red at the tip and stay red, so twelve is this change's own cost. They redden because the fixture mintStandard claims every token under main while the tests pull as workers with other names, so main holds the whole backlog and everyone else is answered wait. That fixture is used in about seventy places across thirty-two files.

THE PROSE CARRIES IT TOO, each copy with its own measured reason. ClaimedHere and NoClaimHere in src/engine/claim.go, and the heading of TestATrackedTokenNeedsAClaimFromThisBox, which asserts a second agent on this box is not refused.

So the ask is to change what a claim means. That is the owner's to decide, and landing it is the line, the fixture, the twelve tests and the three chapters together.

## proposed action

TWO SHAPES WERE OFFERED. The agent's shape means one hand lands the pass, a new fixture, the twelve tests and the chapters together. The box's shape means keeping what the code does, and answering wk-3fe6395f91 with the put-down releasing the claim.

THE SECOND IS WHAT THEY CHOSE. A claim stays the box's. Nothing here is landed and nothing is reddened. wk-3fe6395f91 carries the put-down work.

WHY THE RULING SETTLES IT. The pass would make a claim the agent's, so two hands on one box would contend. They said a box is one actor. Hands inside it are held apart by the holds file, which already works.

## done when

- the owner has said which shape a claim takes: the box's, as the prose says today, or the agent's, as wk-3fe6395f91 asks. ANSWERED, September 2026, in their words: I count this box as one actor, and the actor is you. So the claim keeps the box's shape. The three chapters stand and the twelve tests are never reddened
- the three lines below were conditional on the agent's shape, which was not chosen. They do not apply
- with the agent's shape chosen, TestAPutDownTokenIsNotHandedPastItsClaim is green, decided by go test -run TestAPutDownTokenIsNotHandedPastItsClaim ./ in src/engine
- the twelve tests that redden are green again, decided by go test -count=1 ./ in src/engine showing no failure the branch tip did not already carry
- the chapters that say a claim is the box's and not the agent's read the way the code now behaves, decided by reading ClaimedHere and NoClaimHere in src/engine/claim.go and the heading of TestATrackedTokenNeedsAClaimFromThisBox

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | One meaning of a claim, written down, so the next hand does not re-derive it. |  |
| [x] | what breaks if it is never done, and not only that it stays undone | wk-3fe6395f91 sits behind a question nobody answers, and a hand may land the pass and redden twelve tests. |  |
| [x] | the ask is small enough to review whole, or it is split first | One question. The work it would have caused belongs to wk-3fe6395f91. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | The first by the owner's words, recorded here. The other three were conditional. |  |
| [x] | the basics it stands on exist, or are minted first | The claim, the holds file and wk-3fe6395f91 all exist. |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token, read. The token asked one question, and no code was changed next to the answer. |  |
| [ ] | one test was written first and seen red for the reason expected | Not met, and it cannot be. Keeping the shape the code already has changes nothing to redden. |  |
| [x] | the same test was seen green after the change, and named | The twelve this would have reddened stay green, because nothing was landed. |  |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | This note. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | A token of its own: wk-3fe6395f91 carries the put-down releasing the claim. |  |

