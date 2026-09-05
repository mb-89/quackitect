---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: checks read stale engines
# where the token stands. The process owns these values.
status: done
# who did the work step, so the verdict is never theirs
author: worker-elgar
claimed_by: aeaf7bd9/reviewer-ligeti-two
claimed_at: "2026-09-05T14:36:28Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ff5a5e5d725c964ab9e50e29ec409d34634aa7a5
  - b3ca5148af510a9541448a2f0876827d249dc056
  - 49fddce1ece17a57e3e5e405657f414887fd2175
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 117e4d652ca645c0c67de47228a1eec792e52fc4
  - 7c507e5c40ca62aa4700b3b64c5f5ce8d6e8ec9e
---

## detail

The checks that drive a page ask for their data through .bin/se, and that command proxies to whatever engine is running over the tree. So a check reads the behaviour of the engine that was started, not of the source it was built from.

Measured on this box. A column was added to the work view and a writable field to the engine. The check went red saying the column was locked, because the running engine was four minutes older than the tree and its ruling knew no such field. The same check, over a tree carrying a current engine, passed every assertion.

se --swap answers that the next engine is built and takes over when the calls in flight finish. It did not take over while another agent worked, so .bin/se stayed on the old build and every driven check kept reading it.

The Go lane already answers this: se test builds se.fresh and names it. The check lane does not.

## proposed action

Point the check lane at the fresh engine the Go lane builds, or make a driven check name the build that answered it, so a stale engine reads as a stale engine rather than as a defect in the change.

## done when

- a driven check names the engine build that answered it
- a check run over a tree whose engine is older than its source says so, and does not report the change as the fault
- one tree, one check, run before and after a swap, answers the same

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | the approach section: SE_ENGINE handed by runChosen, started by lib/engine.mjs, named on each check's run with the resident's age when stale |  |
| [x] | every done-when line is decidable, and names the command where one decides it | lines 1 and 2 by se test --propose TestACheckIsHandedTheFreshEngineAndNamesIt and TestACheckOverAStaleEngineSaysSo. Line 3 by se test --propose engine-args before and after se --swap --work . |  |
| [x] | the change is small enough to review whole, or it is split first | one field on ran, one branch of runChosen, two small functions, one line in lib/engine.mjs, two tests |  |
| [x] | the basics it stands on exist, or are minted first | suiteEngine, engineToRun and the fed toolchain all existed for the Go lane |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token.md read. The red: both tests failed to build, runs[0].Engine undefined |  |
| [x] | the change follows the approach on the token, or the token says why it departed | it follows it |  |
| [x] | se test --on this token answered ok, and what it ran is named | TestACheckIsHandedTheFreshEngineAndNamesIt, TestACheckOverAStaleEngineSaysSo, TestTheSuiteDrivesAnEngineNoOlderThanItsTree ok, mcp-tools and engine-args ok. engine-args answered ok before se --swap and ok after, the engine process handed over at the record's started field with the same build. gofmt, go build and go vet clean |  |
| [x] | the note says what changed and why, for a reader who was not here | the note section |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | none revealed. A check over the tree still asks the resident engine, which the approach says and the run now names |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | [[reviewing]] was read and applied | Read whole. One round, the bar improvement | |
| [x] | every hunk of git diff began..ended was read, and any not read is named | All four of this token's files in ff5a5e5d..7c507e5c. Unread: the identity and staffing hunks, other tokens'. The change is on origin/v4, not lost | |
| [x] | every criterion's command was run again, and what it said is named | On a clean origin/v4 copy, this tree not building: both named tests PASS, vet silent. The swap line not re-run, no second engine stayed up | |
| [x] | every hunk improves the product, or a finding names the one that does not | Pass. The SE_ENGINE seam, the mjs hand-off, the Engine field and both tests earn it | |
| [x] | every finding is a trivial token naming this one, and their ids are here | wk-a18983bcc5, mine: a stray SE_ENGINE is inherited. Standing, confirmed here: wk-8e717ef911, wk-9753f669de | |

## approach

The check lane is given what the Go lane has: an engine chosen for freshness, handed in, and named in the answer.

runChosen decides the engine once, through suiteEngine, for checks as for Go tests. The resident .bin/se serves while it is newer than every source under src/engine, otherwise se.fresh is built from the tree. The check is spawned with SE_ENGINE set to that path, and the answer names it and its age.

util/checks/lib/engine.mjs starts SE_ENGINE when set, and .bin/se when not. A check that raises an engine over a folder of its own then drives the fresh build. It answers the same before and after a swap.

A check over the tree itself, render-check and its kin, asks the resident engine. No binary handed in changes who answers. So each check's ran entry names the engine handed. When the resident is older than its source it says so too, with the newer file and the swap that cures it. A failure then reads as the engine's age first.

Two tests drive runChosen with a check that writes its SE_ENGINE, under the fed toolchain. One sees the handed engine named, the other a stale resident said so.

## note

A check now runs the way a Go test does. runChosen asks suiteEngine once for the engine to drive, the resident .bin/se while it is newer than every source under src/engine and se.fresh built from the tree otherwise. The check is spawned with SE_ENGINE naming it, and util/checks/lib/engine.mjs starts that engine over the check's own folder when it is set. So a check over a throwaway folder drives the source it was written against, and a swap changes nothing it reads.

Each check's ran entry carries an engine field. It names the engine handed. When the resident is older than its source, it says the engine over the tree is stale. It names the newer file and the swap that cures it. A check over the tree asks the resident whatever it was handed, so this is where its age is said.

