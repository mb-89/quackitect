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
# the person's own name for a group. It does not move the work
bucket: tests
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - a9fd0bfc8389eb0b6c1196a85999c706eba3768c
  - cadd31b56b3ef31be2a5a74c16a6ee0bd242eca7
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - d766d3e0bfbeabf201f0d320dcf8cb6f34870758
---

## detail

tests-are-not-hotspots is red in the battery: `FAIL no more than 3 tests run longer than 8s`. It allows three and the mapper has timed four.

se ask over the test table answers TestANameAnotherSessionHoldsIsRefused in src/engine/sessionisanactor_test.go at 15.3s, TestTheQueueIsStaffed in standard_test.go at 12.9s, TestAHandThatWentHomeIsNotAHand in staffinghands_test.go at 9.6s, and TestTheCageHasNoStateWithNoLegalMove in nolegalmove_test.go at 9.2s.

Three of the four sit just over the line, and the check went from ok in .se/tests/battery-20260905-154136.out to FAIL in battery-20260905-160529.out with no change to any of them. The timings are the mapper's, taken on a box carrying twenty agents, so what crossed the line was the load and not the suite.

Two things are wanted and only one is this token. The four are slow because they drive a real tool where testing rule 13 says one test does and the rest are fed. Raising the number would be turning a check off.

## proposed action

Feed three of the four so the mapper times them under eight seconds. Leave the one that drives the real tool, and say on this token which one stays real and why.

## done when

- se ask over the test table answers three or fewer rows with seconds over 8
- tests-are-not-hotspots answers ok in a battery run
- the number in util/checks/tests-are-not-hotspots.mjs is unchanged

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | Three tests stop costing thirty seconds a suite, and the check that watches for drift can be believed again. | the detail |
| [x] | what breaks if it is never done, and not only that it stays undone | The check stays red, so the next real hotspot arrives under a failure nobody reads. | the detail |
| [x] | the ask is small enough to review whole, or it is split first | One helper and three calls to it, one line each. | git diff HEAD --stat |
| [x] | every done-when line is decidable, and names the command where one decides it | Line 1 is se ask over the test table. Line 2 is the check through the door. Line 3 is a diff. | se ask |
| [x] | the basics it stands on exist, or are minted first | SayRunning and Running were both already here, so nothing was minted. | src/engine/watch.go |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read whole. Rule 12 drove red first. Rule 13 left one test real and fed three. | doc/guidance/work-token.md |
| [x] | one test was written first and seen red for the reason expected | A battery answered FAIL no more than 3 tests run longer than 8s. The four ran at 15.3, 13.1, 9.3 and 8.7 seconds. | battery-20260905-190356.out |
| [x] | the same test was seen green after the change, and named | tests-are-not-hotspots answered ok true. The three fed tests now run at 0.19, 0.09 and 0.06 seconds. | /tmp/hot2-web2.txt |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Four test files. One helper, and one call to it in three tests. The check's number is untouched. | git diff HEAD |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | It is a token, wk-98df32b772. loadRunning waits half a second on an engine.json nobody wrote. | wk-98df32b772 |

## note

WHICH ONE STAYS REAL. TestANameAnotherSessionHoldsIsRefused drives answerHook end to end, and it is the only one of the four that names the engine record at all. A suite where every test is fed has stopped checking the cold path.

WHAT THE WAIT WAS. loadRunning reads engine.json twenty times, twenty five milliseconds apart, before believing there is none. TheRunNow asks on every NoteAgent and NoteSession, and StaffingOf asks twice. The seconds were the engine's own retry, not work the tests were doing.

