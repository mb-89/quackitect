---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: an allowlist names events
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: level0
# tokens that have to close before this can start
depends_on:
  - "[[wk-5a0b9d5be0]]"
---

## detail

The door that keeps refusals out of the travelling cage names five events. The harness blocks on at least twelve.

cageCannotBlockCanRefuse names PreToolUse, UserPromptSubmit, Stop, SubagentStop and PreModelSwitch. The published reference also blocks on UserPromptExpansion, PostToolBatch, ConfigChange, TaskCreated, TaskCompleted, TeammateIdle and WorktreeCreate, and PermissionRequest refuses through a decision object rather than an exit code. So a travelling cage registering any of those passes this check and can still refuse a clone that has no engine to argue with, which is the one thing the door exists to prevent. Its own error message says otherwise.

A second fault rides with it. WorktreeCreate aborts on ANY non-zero exit, not on two alone. Every reading in this tree that treats a non-zero exit as a non-blocking error is wrong for that event.

A deny list of names goes stale at each release. An allow list does not.

IT WAITS ON THE PORT. [[wk-5a0b9d5be0]] moves the per-call events into the module and leaves the travelling cage carrying only the wake. What this door then has to guard is a smaller thing, and possibly nothing. So the correction is made after that token, and it decides on the evidence then whether the door is corrected or retired.

## approach

Invert the rule. The travelling cage declares the events it may carry, and anything not named is refused there. An event the harness invents later then defaults to refused-in-the-cage rather than permitted, which is this project's deny-closed rule applied to a file instead of a socket.

The wake stays the one exception, by shape rather than by name, as it is today.

## done when

- a cage naming an event outside the allowed set is refused, whatever the event: a Go test that plants an invented name and asserts the refusal
- the events the local cage carries today are unaffected: `sh util/checks/battery.sh` stays green
- the refusal names the allowed set and the local cage as the two legal moves: the message is read back in the test
- no reading in src/engine treats a non-zero exit as non-blocking without naming WorktreeCreate: a search that answers nothing

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | a rule that cannot go stale replaces one already stale by seven names | the reference's blocking events against the map in the door |
| [x] | what breaks if it is never done, and not only that it stays undone | a clone with no engine can be refused by a rule nothing on it has read, which a cloud session already reported once | the door's own error message |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | one map inverted and one search added | the approach section |
| [x] | every done-when line is decidable, and names the command where one decides it | each line names a test, the battery or a search | the done when section |
| [x] | the change is small enough to review whole, or it is split first | one map, one message and one search | the approach section |
| [x] | the basics it stands on exist, or are minted first | the door, its test and the battery all exist | src/engine/g_the_travelling_cage_cannot_block.go |

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

<!-- read every hunk, run every criterion, and say whether each part improves the product -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |
