---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: engine tests cannot build
# where the token stands. The process owns these values.
status: open
claimed_by: 542bcda8/main
claimed_at: "2026-09-07T11:38:32Z"
---

## detail

src/engine does not compile as a test package at HEAD, so every Go test in it is unrunnable. asubmitisnotheld_test.go calls AStaffShortfall with seven arguments. staffing.go:227 declares five. Both files match HEAD, and git reports neither as modified, so the break is committed rather than local. The test is the landed half of a change: a submit names a token and a disposition, and the staffing guard lets it through. The implementation half is not in the tree. The branch-head-builds check did not catch it, because a build over the non-test sources passes. Measured: go build over src/engine exits 0, and se test answers that the cover binary will not build.

## proposed action

Land the half that is missing. AStaffShortfall takes the token id and the disposition the call carries, and refuses nothing when both are there. The narrowing already written for Bash is the shape to follow. A pull naming both is a submit and goes through, and a bare pull is still held.

## done when

- src/engine builds as a test package, decided by: se test naming any test in src/engine
- TestAShortfallLetsASubmitThrough passes, decided by: se test proposing it by name
- a check fails when the non-test sources build and the test package does not, decided by: node util/checks/the-branch-head-builds.mjs run from the root

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the approach is on the token before any work, as an interface or a shape a reader can disagree with |  |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the change is small enough to review whole, or it is split first | — |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | the change follows the approach on the token, or the token says why it departed |  |  |
| [ ] | se test --on this token answered ok, and what it ran is named |  |  |
| [ ] | the note says what changed and why, for a reader who was not here |  |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

