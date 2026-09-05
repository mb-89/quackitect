---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: tests build their engine
# where the token stands. The process owns these values.
status: done
# who did the work step, so the verdict is never theirs
author: worker-birch
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - d5e1c2b28e8a0778110e6f1f7b4372887c4596cd
  - e529ad30457cef1729d1f4fe9e3ed04718a6e0dc
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - db3347465840fcbe11619631058230c246878779
  - a2934a98ddead0e64baeaa8729e8a5d04a42b054
---

## detail

TestMain in src/engine/enginebin_test.go uses the binary named in SE_ENGINE when that file exists, and se_test sets SE_ENGINE to the resident binary in .bin. So every test that drives the engine as a subprocess runs the last swapped engine rather than the working tree.

A hook change then reads as not taken until a swap lands, while in-process tests over the same code pass at the same moment.

That split cost a wrong diagnosis. TestABlockedClaimStandsWhenTheQueueIsEmpty and TestAnyActionSpendsTheClaim stayed red after a correct fix, and TestAClaimWithEmptyHandsIsGrantedAtOnce over the same lines was green.

An agent reading those three answers cannot tell a bad fix from a stale binary.

## proposed action

Build the suite engine from the tree when the tree is newer than SE_ENGINE, and name the binary and its age in the test answer either way.

## done when

- with a source file newer than SE_ENGINE, the suite runs a binary built from the tree: se test --propose 'TestAnEngineOlderThanTheTreeIsNotDriven' answers ok
- with SE_ENGINE newer than every source file, the suite runs SE_ENGINE and builds nothing: se test --propose 'TestAnEngineNewerThanTheTreeIsDriven' answers ok
- the test answer names which binary ran and how old it is: se test --propose 'TestTheSuiteSaysWhichEngineItDrives' answers ok
- a change to a hook is seen by a subprocess test without a swap: se test --propose 'TestTheEngineTheSuiteDrivesIsNoOlderThanTheTree' answers ok

## evidence: 1 a source newer than SE_ENGINE builds from the tree

TestAnEngineOlderThanTheTreeIsNotDriven: ok. It stamps a binary an hour older than hook.go and asks theNamedEngine, which answers no and names hook.go.

## evidence: 2 SE_ENGINE newer than every source builds nothing

TestAnEngineNewerThanTheTreeIsDriven: ok. The same function answers yes and names the binary, and TestMain runs m.Run without reaching the build when it does. This is the battery's case, and its lane still takes 75s rather than 77s.

## evidence: 3 the answer names the binary and its age

TestTheSuiteSaysWhichEngineItDrives: ok. Both branches are driven and each answer names the binary and says how old it is. The battery and the engine both run the test binary directly, so the line lands in what they print.

## evidence: 4 a hook change is seen without a swap

TestTheEngineTheSuiteDrivesIsNoOlderThanTheTree: ok. It stats the engine the suite is actually driving and refuses one older than the newest Go file under src/engine. Watched both ways: with .bin/se just rebuilt it passes in 0.03s off the named binary, and after touching src/engine/hook.go the same test passes in 3.5s off a build made from the tree.

## evidence: nothing else broke

Twelve tests that drive the engine as a subprocess ran green: TestAVerbRunsInsideTheEngineAndTheClientPrintsIt, TestEveryRungButGodNamesItsToken, TestTheThreeAnswersLandWithTheGuardStanding, TestGodModeRefusesNothingAndIsNotSpoken, TestUnboundTakesTheQueueOffAndLeavesTheTreeGuarded, TestTheQueueIsStaffed, TestTheRegisterFollowsAgentsInAndOut, TestTwoSessionsAreTwoActors, TestAnAgentSeenAfterARestartIsHereAgain, TestTheCageHasNoStateWithNoLegalMove, TestABrokenRebuildRefusesRatherThanRunningTheStaleBinary and TestTheModelAnswersOnItsSocketAndClientsGoColdWithoutIt. gofmt names no file and go vet over src/engine answers nothing.

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | Written at the mint and read before the first line. A reader can disagree with building at all. | the approach |
| [x] | every done-when line is decidable, and names the command where one decides it | All four named no command. Each names one now, and each is a test that exists. | done when |
| [x] | the change is small enough to review whole, or it is split first | One test file rewritten, one added, nothing outside src/engine. | — |
| [x] | the basics it stands on exist, or are minted first | exeName is there. wk-711bbd91ec is making the same decision for the node checks and is held by another box, so the two want one function. | wk-711bbd91ec |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Five checks first, red on an undefined theNamedEngine. | the red run |
| [x] | the change follows the approach on the token, or the token says why it departed | It departs on where the build lands. The approach says a temporary path, and this is one, named for the newest source. | aFreshEngine |
| [x] | se test --on this token answered ok, and what it ran is named | The five green, and twelve engine-driving tests beside them. The first run after a source change took 3.5s, the next 0.03s. | se test |
| [x] | the note says what changed and why, for a reader who was not here | enginebin_test.go says why the binary is this tree's, why it is built once, and why it lands by rename. | the file |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | An env assignment walks past the guard. | wk-da97a4c368 |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

## evidence: the cleanup

wk-da97a4c368: `go test -h` is refused by the tests-via-engine guard and `FOO=1 go test -h` is not, so an environment assignment in front of a command walks past it.

## evidence: the departure

The approach says the build goes to a temporary path. It does, and the path is named for the newest source under src/engine rather than made fresh each run: the engine runs every selected test as its own process, so a build inside TestMain would be a build per test and a batch of forty would pay the link forty times. Measured: 3.5s for the run that builds, 0.03s for the next. It lands by rename, because two agents run this suite on one box.

## approach

TestMain compares the newest source file under src/engine against the timestamp on SE_ENGINE. Newer tree, and it builds into a temporary path and runs that. Older tree, and it runs SE_ENGINE untouched.

The answer names the binary either way, with its age. A stale run then says so rather than reading as a failed fix.

The build is the ordinary go build, aimed at a temporary path. It is not aimed at .bin, which the build guard refuses.

