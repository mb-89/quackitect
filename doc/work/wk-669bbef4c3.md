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

