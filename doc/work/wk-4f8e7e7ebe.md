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
status: open
claimed_by: aeaf7bd9/worker-sibelius
claimed_at: "2026-09-05T15:47:44Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - d5e1c2b28e8a0778110e6f1f7b4372887c4596cd
  - fc1dcc58bde4c49a2d927c01137522c3931927c3
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - db3347465840fcbe11619631058230c246878779
---

## detail

TestMain in src/engine/enginebin_test.go uses the binary named in SE_ENGINE when that file exists, and se_test sets SE_ENGINE to the resident binary in .bin. So every test that drives the engine as a subprocess runs the last swapped engine rather than the working tree.

A hook change then reads as not taken until a swap lands, while in-process tests over the same code pass at the same moment.

That split cost a wrong diagnosis. TestABlockedClaimStandsWhenTheQueueIsEmpty and TestAnyActionSpendsTheClaim stayed red after a correct fix, and TestAClaimWithEmptyHandsIsGrantedAtOnce over the same lines was green.

An agent reading those three answers cannot tell a bad fix from a stale binary.

## proposed action

Build the suite engine from the tree when the tree is newer than SE_ENGINE, and name the binary and its age in the test answer either way.

## done when

- with a source file newer than SE_ENGINE, the suite runs a binary built from the tree
- with SE_ENGINE newer than every source file, the suite runs SE_ENGINE and builds nothing
- the test answer names which binary ran and how old it is
- a change to a hook is seen by a subprocess test without a swap, proved by a Go test in src/engine

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | the proposed action names it: build from the tree when the tree is newer than SE_ENGINE, and name the binary and its age either way. | the proposed action, above |
| [x] | every done-when line is decidable, and names the command where one decides it | each of the four is a Go test in src/engine, run below by name. | `se test --on wk-4f8e7e7ebe` |
| [x] | the change is small enough to review whole, or it is split first | one file, enginefresh.go, and the TestMain that calls it. | `git diff fc27d9b1^ fc27d9b1 -- src/engine/enginebin_test.go` |
| [x] | the basics it stands on exist, or are minted first | newestSource and exeName both existed. Nothing was minted. | src/engine/enginefresh.go |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | read. Every criterion was run. | doc/guidance/work-token.md |
| [x] | the change follows the approach on the token, or the token says why it departed | it does, and all of it was in the tree at began. fc27d9b1 carries enginefresh.go and the TestMain that calls it. | `git log -1 -- src/engine/enginefresh.go` |
| [x] | se test --on this token answered ok, and what it ran is named | ok on all four: TestATreeNewerThanTheEngineIsBuilt, TestAnEngineNewerThanTheTreeIsRunAsItIs, TestTheSuiteDrivesAnEngineNoOlderThanItsTree, TestTheAnswerNamesTheEngineItDrove. | the answer |
| [x] | the note says what changed and why, for a reader who was not here | the commit message says it. That same answer carries the third line whole, naming the engine it drove and its age. | the commit message |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | ten stray copies of engine sources with a leading underscore sit untracked beside the real ones. wk-885646032c holds that. | the left out list |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

## approach

TestMain compares the newest source file under src/engine against the timestamp on SE_ENGINE. Newer tree, and it builds into a temporary path and runs that. Older tree, and it runs SE_ENGINE untouched.

The answer names the binary either way, with its age. A stale run then says so rather than reading as a failed fix.

The build is the ordinary go build, aimed at a temporary path. It is not aimed at .bin, which the build guard refuses.

