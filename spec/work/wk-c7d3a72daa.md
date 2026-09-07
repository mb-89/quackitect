---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the gate records nothing
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: tests
---

## detail

Found reviewing wk-5c682f1a25, which put a gate on the close that asks what the engine ran. The gate is right and the store it reads is never written, so a close still gates nothing.

Measured on this box on 2026-09-06. After a dozen runs of se test --on <id> through the agent lane and three more at a prompt, .se/tested.json does not exist, and find / -name tested.json answers nothing. LastRunOn finds no record, TestsRefuseTheClose answers the empty string every time, and submit lets every token through.

It is not a stale binary. Both .bin/se and one se test had just built from the tree carry testedgate.go's strings, and both write no store. --on was read, because the answer's since is the token's began snapshot. It is the same with and without --propose, and with --work naming the tree. The private folder is writable and nothing sweeps it: a probe file written beside it stayed.

Two closes went through under it while I reviewed. On wk-fa2dd32c33 my last run was deliberately red and the verdict settled without a word.

The tests pass because they call RecordTheRun in the same process, at testedgate_test.go:38 and :62. Nothing drives the test verb and reads the store back, which is the seam the change rests on.

The call sits at src/engine/tests.go:148-153 and RecordTheRun at src/engine/testedgate.go:62. One of them does not do what it reads as doing. Find which, fix it, and make the seam a test.

## proposed action

Find why se test writes no store in a real tree, fix it, and drive the seam with a test that runs the test verb and reads LastRunOn back.

## approach

The first thing to test is not in either place the detail names, and it costs one command.

Every tool call is answered by the engine that lives, in its own process, and runVerbInside runs the verb there. A rebuilt .bin/se does not replace a running resident. So a binary carrying testedgate.go's strings, and an engine answering without them, are one box at one moment.

Ask the running engine for its build rather than the file on disk. wk-084e23e08b puts the age of the answering engine onto the answer itself, which is the reading this wants.

If that is it, the fix is a restart, and the defect is the silence rather than the store.

If it is not, the seam test decides between the two places the detail names. It drives the test verb over a fixture tree and reads LastRunOn back. It has to drive the verb rather than call RecordTheRun, because testedgate_test.go already calls it in process and passes.

## done when

- se test --on an id over a real tree leaves a record for that id. Decided by: se test --on this id --propose TestTheTestVerbWritesTheRunItRan, a test that runs the verb over a fixture tree and reads LastRunOn back
- a submission on a token whose recorded run passed is accepted, and the test drives the submission rather than the gate alone. Decided by the same test
- a submission on a token whose recorded run went red is still refused. Decided by: se test --propose TestASubmissionIsRefusedWhenTheRunWasRed, which must stay green

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

