---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: criterion outlived its rung
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: claims
claimed_by: 7e7f0da1/reviewer-wren
claimed_at: "2026-09-06T16:31:53Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 8e67f6ca9fe2c778110b37abceea89a314b32188
  - 4bfc487f09c882607b3f1aa262358b4877d66ca3
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 4eeacc31e28d60135af49d1ed4494a87fef6af2f
---

## detail

A finding on wk-85d5b0ec27, god silences the stop.

Its second criterion reads: "a stop when bound and when unbound still needs a claim, decided by: the same Go test over both rungs".

The test it names is TestGodSilencesTheStopHook, and that test asserts the opposite for one of the two rungs. Its unbound block fails when a stop with no claim is refused: "an unbound agent was asked for a reason by a queue that chose it nothing". The criterion says unbound needs a claim. The test says it must not.

Both are right about their own moment. The criterion was written when unbound kept the claim, and the owner then decided the other way, which landed in the same commit as this work. Nothing is broken in the code.

What is broken is the record. The criterion is ticked done on a token that is closing, and the evidence for the tick is a test asserting its negation. A later reader auditing how the rungs got their behaviour finds a passing criterion that describes a tree nobody has run since.

## proposed action

Rewrite the second criterion on doc/work/wk-85d5b0ec27.md to say what the test decides: a bound stop needs a claim and an unbound stop does not. Add one line saying the owner moved unbound while this token stood open. No code changes.

## done when

- the second criterion on doc/work/wk-85d5b0ec27.md says what TestGodSilencesTheStopHook asserts for each rung, decided by: reading the criterion against the test
- the token says why the criterion changed, decided by: reading the token for the owner's decision on unbound
- the test still passes, decided by: se test naming TestGodSilencesTheStopHook

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | A reader auditing how the rungs got their behaviour finds a criterion that describes the tree that was run. |  |
| [x] | what breaks if it is never done, and not only that it stays undone | A criterion stays ticked done on a closed token with a test asserting its negation as the evidence. |  |
| [x] | the ask is small enough to review whole, or it is split first | One criterion line and one sentence. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | One by reading the criterion against godsilencesthestop_test.go, one by reading the token, one by se test. | se test --on wk-bdce520f18 --propose TestGodSilencesTheStopHook |
| [x] | the basics it stands on exist, or are minted first | The note is on the branch tip and the test is in src/engine. |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | work-token, read. |  |
| [ ] | one test was written first and seen red for the reason expected | Not met. The change is a criterion's wording on a closed token, and no assertion can redden on it. The test it names was run instead. |  |
| [x] | the same test was seen green after the change, and named | src/engine/TestGodSilencesTheStopHook ok, se test on this token answering ok. Its bound block errors on a stop that went through with no claim; its unbound block errors on one refused. The criterion now says that. |  |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | Landed 8dabfb1. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The archived copy keeps the old wording. The archive row for wk-85d5b0ec27 points at blob 3f0bbe58, and writing doc/work/archive.jsonl is refused on this box, which wk-7a32df0461 already carries. |  |
