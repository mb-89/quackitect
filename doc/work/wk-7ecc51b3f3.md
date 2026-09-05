---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: four tests pass eight
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-hawthorn
claimed_at: "2026-09-05T16:43:33Z"
---

## detail

tests-are-not-hotspots is red in the battery: `FAIL no more than 3 tests run longer than 8s`. It allows three and the mapper has timed four.

se ask over the test table answers TestANameAnotherSessionHoldsIsRefused in src/engine/sessionisanactor_test.go at 15.3s, TestTheQueueIsStaffed in standard_test.go at 12.9s, TestAHandThatWentHomeIsNotAHand in staffinghands_test.go at 9.6s, and TestTheCageHasNoStateWithNoLegalMove in nolegalmove_test.go at 9.2s.

Three of the four sit just over the line, and the check went from ok in .se/tests/battery-20260905-154136.out to FAIL in battery-20260905-160529.out with no change to any of them. The timings are the mapper's, taken on a box carrying twenty agents, so what crossed the line was the load and not the suite.

Two things are wanted and only one is this token. The four are slow because they drive a real tool where testing rule 13 says one test does and the rest are fed. Raising the number would be turning a check off.</detail>
<parameter name="proposed_action">Feed three of the four so the mapper times them under eight seconds, leaving the one that drives the real tool. Say on this token which one stays real and why.

## done when

- se ask over the test table answers three or fewer rows with seconds over 8
- tests-are-not-hotspots answers ok in a battery run
- the number in util/checks/tests-are-not-hotspots.mjs is unchanged

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

