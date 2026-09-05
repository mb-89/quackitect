---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[note]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: verdict for wk-fc6b6c5aa7
# where the token stands. The process owns these values.
status: noted
claimed_by: aeaf7bd9/reviewer-nono
claimed_at: "2026-09-05T13:58:37Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 86d2978bd5ea7332b8d9228a5e676f8004eee3c1
---

## detail

A VERDICT THAT COULD NOT BE SUBMITTED.

reviewer-charlie reviewed wk-fc6b6c5aa7. This session has no se_ tool lane, and the submission door at a shell is a pipe the write gate refuses, so se pull could not be handed the payload. wk-4cb6df2b99 names that blocker. The verdict is written here so it is not lost.

IT WAS BORN IN .se/work, WHICH DIES WITH THE BOX, and was moved to doc/work so a reviewer with a lane could find it.

PASS. The change holds its criteria and leaves the tree better.

VERIFIED. se test --propose ran TestOneFolderAnswersOneDoor, TestAStartLeavesTheSettingsAsTheyWere and TestTheCageSendsCallsToTheDoorAndWakesTheEngine, and all three answered ok. The fifth criterion was run live: se --swap restarted the engine onto a new build and a new pid, .claude/settings.json and .se/engine.json still name port 30268, and a Bash call of git status was refused again. The door survived a mid-session restart, which is what this token was written for.

NOT READ. git diff began..ended, because git is a shell command and the shell is refused. The change was read as files instead: src/engine/hookserve.go from the port comment to hooksURL, and src/engine/onedoorperfolder_test.go whole. A hunk outside those two files was not read.

FINDINGS. One, wk-0c3a3eed68: the backslash fold in theSameFolderEveryTime is unconditional, so two POSIX folders can answer one door.

ALSO SEEN. TestAStartLeavesTheSettingsAsTheyWere would have been green before the change, and filepath.Abs already folds separators for the platform it runs on, so the drive letter row is the one that was red.

## proposed action

A reviewer holding a tool lane submits this verdict on wk-fc6b6c5aa7 through se pull, and closes this note.

## evidence: step 1. write

<!-- write it down so a stranger understands it, and cut what nobody needs -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Read, and the note is answered as [[reviewing]] asks. | pass |
| [x] | the smallest case that still shows it | One verdict a lane-less session could not submit. | pass |
| [x] | why it is a problem, and not only what happened | A verdict nobody can submit leaves its token stranded at done. | pass |
| [x] | a stranger could act on this without asking you anything | The proposed action names the door and the token. | pass |
| [x] | is this a symptom of something bigger, and not only its instance | Yes, and wk-4cb6df2b99 carried it and is closed done. | pass |

## evidence: step 2. decide

<!-- decide what to do with it. To say it is not ready, name why. depends_on is for other tokens that have to close first, and the engine decides it on its own. ready_when is anything else, in whatever words fit, a date or a condition only a person judges. Deciding not to decide ends nothing: you leave the activity, no transition happens, the note stays noted, and the call log holds that you looked. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the note was read whole, and not only its title | Read whole, detail and both steps. | pass |
| [x] | the disposition says what happened | Dropped. Everything it asks for has already happened. | pass |
| [x] | a became names its successor, and that token exists | Not a became. Its successors were minted and closed by other hands. | pass |
| [x] | a dropped says why, in a sentence about this note | The reason names the three tokens, all closed done. | pass |
| [x] | not now is ready_when, and not a disposition | Not a not-now. There is nothing left to wait for. | pass |

