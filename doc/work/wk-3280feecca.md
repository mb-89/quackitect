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
# true when this waits for a person rather than an agent
needs_human: true
---

## detail

A claim is the box's and not the agent's. Three chapters say so and the suite encodes it. wk-3fe6395f91 asks the queue to pass over a token claimed by an actor other than the one pulling, which makes the claim the agent's instead.

MEASURED IN SEPTEMBER 2026, on a detached worktree at the branch tip. The pass in nextAmong, in src/engine/pull.go, asks whether a claim is ClaimedHere. Asking instead whether it is this actor's own is the whole behaviour change, one line.

WHAT IT COSTS. That line turns TestAPutDownTokenIsNotHandedPastItsClaim from red to green and turns twelve green tests red. Eight others were already red at the tip and stay red, so twelve is this change's own cost. They redden because the fixture mintStandard claims every token under main while the tests pull as workers with other names, so main holds the whole backlog and everyone else is answered wait. That fixture is used in about seventy places across thirty-two files.

THE PROSE CARRIES IT TOO, each copy with its own measured reason. ClaimedHere and NoClaimHere in src/engine/claim.go, and the heading of TestATrackedTokenNeedsAClaimFromThisBox, which asserts a second agent on this box is not refused.

So the ask is to change what a claim means. That is the owner's to decide, and landing it is the line, the fixture, the twelve tests and the three chapters together.

## proposed action

My best attempt: the owner picks the agent's shape, and one hand lands the one-line pass, a fixture that claims under the actor that will pull, the twelve tests and the chapters in one change. The alternative is to keep the box's shape and answer wk-3fe6395f91 by having the put-down release the claim, which that token's own note calls the riskier half.

## done when

- the owner has said which shape a claim takes: the box's, as the prose says today, or the agent's, as wk-3fe6395f91 asks
- with the agent's shape chosen, TestAPutDownTokenIsNotHandedPastItsClaim is green, decided by go test -run TestAPutDownTokenIsNotHandedPastItsClaim ./ in src/engine
- the twelve tests that redden are green again, decided by go test -count=1 ./ in src/engine showing no failure the branch tip did not already carry
- the chapters that say a claim is the box's and not the agent's read the way the code now behaves, decided by reading ClaimedHere and NoClaimHere in src/engine/claim.go and the heading of TestATrackedTokenNeedsAClaimFromThisBox

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

