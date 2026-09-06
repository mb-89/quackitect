---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a pull claims first
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: queue
---

## detail

Finding from the verdict on wk-239cae9216 (a claim gates tracked).

The gate sits in TakeUp (src/engine/gate.go:185), and the queue does not go through TakeUp. take() in src/engine/pull.go:739 sets the holder and saves, with no claim. So a pull of an unclaimed tracked token hands it out, and the agent's first se run --on or se apply --on is refused with "travels, and this box holds no claim on it". Measured on this box: the reviewer pull of wk-239cae9216 itself was followed by that refusal, and one se claim call, before any command ran.

Damage: every pull of tracked work, on every box, costs one refused call and one claim call; a reviewer has to publish a claim on a token it only owes a verdict; and the pull's answer "This is yours now" is not true until the claim lands.

The queue already skips tokens another box claims (pull.go:695). What is missing is the other half: what it hands to this box, it claims for this box, or it tells the agent to claim in the same answer.

## proposed action

Have take() in pull.go claim the token for this box before handing it out, or refuse to hand out what the box may not work and say so in the notice.

## done when

- a Pull of an unclaimed tracked token followed by TakeUp for the same actor succeeds, or the pull answer names se claim. A test in src/engine/claimgate_test.go drives it: cd src/engine && go test -run TestAPullLeavesNoClaimToMake -count=1 .
- the reviewer queue is covered by the same test, or a second one beside it

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

