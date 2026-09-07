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
status: done
# the person's own name for a group. It does not move the work
bucket: tests
# who did the work step, so the verdict is never theirs
author: main
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 7b85042fb562cc320f19352c380f15c4868f33cd
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 7ffca29b7454afc006c39566a7b6b67ae228e0e8
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

## evidence: commits

71cfcbe9 the test. da1bb77f the evidence. Both on group/tests.

## evidence: criterion 1

se test --on an id over a real tree leaves a record for that id. TestTheTestVerbWritesTheRunItRan drives runTest through a call, over a fixture tree with the processes, and reads LastRunOn back. Green.

## evidence: criterion 2

a submission on a token whose recorded run passed is accepted, and the test drives the submission. The same test puts a Pull through with disposition done and asserts no finding names the run: not did not pass, not had not finished. Green.

## evidence: criterion 3

TestASubmissionIsRefusedWhenTheRunWasRed stays green, and stayed green through every step here, including the inversion below.

## evidence: nothing in src changed

the inversion was backed out and git status showed only the test file before the commit.

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | The gate is proved to have something to read. One that is right and reads nothing lets every close through. |  |
| [x] | what breaks if it is never done, and not only that it stays undone | Both tests here pass whether or not the verb writes, so the store could stop being written unnoticed. |  |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | It is, and it names the cheap reading first: ask the engine that answers, not the file on disk. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | All three. Two by the new test, the third by TestASubmissionIsRefusedWhenTheRunWasRed, green throughout. |  |
| [x] | the change is small enough to review whole, or it is split first | — |  |
| [x] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | — |  |
| [x] | the change follows the approach on the token, or the token says why it departed | Its first step decided it. .se/tested.json is on this box and carries this session's runs, the first at 14:22:28Z, so the store is written and the reported defect is not here. The seam test is the second step, and it was written anyway. |  |
| [x] | se test --on this token answered ok, and what it ran is named | TestTheTestVerbWritesTheRunItRan, TestASubmissionIsRefusedWhenTheRunWasRed and TestACloseAsksWhatTheEngineRan, all green. |  |
| [x] | the note says what changed and why, for a reader who was not here | Commit 71cfcbe9 says what the test does and what it worked around. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | None in src. A whole-diff delta starts the battery and records the run pending, and the gate refuses a close on a pending run. The test's comments carry it. |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

## evidence: the began snapshot

7b85042f is no object in this clone, so the change reads against HEAD.

## evidence: the detail's premise does not hold on this box

it says .se/tested.json does not exist and find answers nothing. Here it exists and carries this session's runs, the first keyed wk-113887f540 at 2026-09-07T14:22:28Z. The report was measured on another box on 2026-09-06. The approach's own first step is what decided this: ask the engine that answers rather than the file on disk.

## evidence: the red, and what it proves

the record was wired out of runTest, one condition. TestTheTestVerbWritesTheRunItRan failed saying the verb ran and wrote no record, so the gate reads nothing. TestACloseAsksWhatTheEngineRan and TestASubmissionIsRefusedWhenTheRunWasRed both stayed green under that, because both call RecordTheRun in the same process. That is exactly the seam the detail says is open, and it is now closed.

## evidence: two shapes the test had to work around

a token with nothing in the record has the whole diff for a delta, and a whole diff starts the battery outside the engine whatever is proposed. That run is recorded pending, which is neither a pass nor a failure, and the gate refuses a close on it. So the fixture applies one file through the token first, and proposes a name that reaches nothing. Both are in the test's comments, because an agent's first se test on a fresh token meets them.

