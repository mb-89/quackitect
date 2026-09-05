---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: over-budget relent keeps work
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-sibelius
claimed_at: "2026-09-05T17:05:31Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 884404cfa8122e1eb6c9d60da7dd85eb8c4a3673
---

## detail

Found reviewing wk-1c9dc4ef28, "stops hand work back".

src/engine/hook.go, case SubagentStop. The budget guard runs first, and when it has refused enough times it records "relenting" and breaks the case at line 601. break leaves the switch, so everything the token added below it is skipped: the holding-work refusal, forgetRefusedStops, PutDownWhatTheyHeld and AgentGone.

So a helper that is over budget and holding an open token is let go on the third turn with the token still in its hands, and neither door the token opened is reached. That is the defect the detail names, on one of the two ways a helper stops. What is left is the sweep at the next engine start, so the row sits in the panel until then.

The two guards also read the relent differently. Line 598 asks countRefusedStop against helperRefusalsBeforeRelenting inline, while the second asks AHelperStopStillRefused, whose comment says both halves ask one function.

## done when

- a Go test in src/engine drives a SubagentStop from a helper that is both over budget and holding an open token, on the turn the budget guard relents, and the token comes back with no holder
- the release and AgentGone are reached on every path that lets a helper go, not only the one below the budget guard

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one branch inverted in the SubagentStop case, one sibling function beside it, one test. | `git diff -- src/engine/hook.go` |
| [x] | every done-when line is decidable, and names the command where one decides it | both by the test below, which drives the two doors in order through the hook. | `go test -run TestAnOverBudgetRelentDoesNotWalkOffWithTheWork` |
| [x] | the basics it stands on exist, or are minted first | aGhost, mintStandard, hookSays and decisionOf all existed. Nothing was minted. | src/engine/goneputsdown_test.go |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | read. Red first, then green. | doc/guidance/work-token.md |
| [x] | one test was written first and seen red for the reason expected | on a clean copy of origin/v4 it fails saying the budget guard relented and let a helper walk away holding its token, the hook answering nothing. | `go test -run TestAnOverBudgetRelentDoesNotWalkOffWithTheWork` |
| [x] | the same test was seen green after the change, and named | green, with TestAHelperReturningWhatItReadIsSentBackToDigest and the gone tests beside it. The nine failures left are other hands'. | same |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | the relent falls through rather than breaking, and reads AHelperAnswerStillRefused rather than the count inline. | `git diff` |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | the two doors ask one shape now. A second find is wk-399cb8cf7f: the budget asks by harness id, the read is kept under the pulled-with name. | wk-399cb8cf7f |

