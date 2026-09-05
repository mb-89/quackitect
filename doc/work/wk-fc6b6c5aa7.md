---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: restart silences every guard
# where the token stands. The process owns these values.
status: done
# who did the work step, so the verdict is never theirs
author: main
claimed_by: aeaf7bd9/reviewer-berio
claimed_at: "2026-09-05T14:23:02Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ee54932f7938aaf3c47895b1b42dae6f8e7dc74c
  - 3c73b3c91456e129545cbafb0c5b7a9be0960f32
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - d808d74f1c11b56804dad8078aaf5281726918d2
---

## detail

THE CLASS IS WRITING DOWN SOMETHING EPHEMERAL.

A port is valid only while the process that opened it lives. A settings file is read once and is meant to outlive any run. Write the first into the second and it is stale by design. The port is this instance, not the rule.

WHAT HAPPENED. The engine picks a hook port at start and writes it into .claude/settings.json. The harness reads that file once, when the session begins. A restart moves the port, and the session goes on knocking at a door that died.

MEASURED. The engine was restarted mid-session. engine.json and settings.json both name port 39056. This session still posts to 32112. A Bash call of echo probe went straight through, where the same call was refused before the restart. Every guard rides on that door, so all of them were absent and nothing said so.

THE MECHANISM. hooksPort in src/engine/hookserve.go hashes r.Work and maps it into a range. The intent is right: one folder, one door, nameable before any engine starts. It hashes the path as a string, and the path is not canonical. This session was handed the folder as c: and as C:, which Windows means the same folder by. Lowercase answers 32112 and uppercase 39056. One folder grew two doors, and the settings file was rewritten when the second appeared.

## proposed action

One folder answers one door, however the folder is spelled.

hooksPort canonicalises the work root before it hashes. Nothing ephemeral is written down, because the port stays what it always was: a function of the tree. The settings file is written once and never rewritten.

HTTP stays. The comment above the hooks gives the reason and it holds.

Two checks keep the class shut. Several spellings of one path answer one port. And an engine start leaves the settings file byte for byte as it was.

## done when

- one folder answers one port however it is spelled. A table test in src/engine drives hooksPort over spellings of one path and asserts one answer
- the table carries drive-letter case, a trailing separator, and forward against back slashes
- that table is watched red before the change, and the red run is named in the evidence
- an engine start writes nothing into .claude/settings.json: a Go test starts it twice over one tree and asserts the file is unchanged
- a call is still guarded after a mid-session restart: restart the engine, then run a Bash command the guard refuses. It is refused again

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | proposed action names the shape: hooksPort canonicalises before it hashes. A reader can disagree by naming a command hook instead, which drops HTTP. | proposed action |
| [x] | every done-when line is decidable, and names the command where one decides it | Lines 1 to 4 are decided by Go tests in src/engine, run by se test. Line 5 is a restart and one Bash call, run by hand. | done when |
| [x] | the change is small enough to review whole, or it is split first | One function in hookserve.go, and its table. | — |
| [x] | the basics it stands on exist, or are minted first | hooksPort and the settings writer both exist. Nothing is missing under this. | src/engine/hookserve.go:48 |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | The table was written first and watched red on all four rows, naming 32112 against 39056. | the red run |
| [x] | the change follows the approach on the token, or the token says why it departed | It follows it. The approach changed twice under the owner's correction, and the token carries the reading that survived. | proposed action |
| [x] | se test --on this token answered ok, and what it ran is named | ok. TestOneFolderAnswersOneDoor, TestAStartLeavesTheSettingsAsTheyWere, TestTheCageSendsCallsToTheDoorAndWakesTheEngine. | 5.0s |
| [x] | the note says what changed and why, for a reader who was not here | theSameFolderEveryTime canonicalises the work root before hooksPort hashes it. It is lexical, so it answers before the folder exists and on every platform. | hookserve.go:48 |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | The panel light read a dead engine, which was the engine being down. Nothing else was revealed. | — |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | [[reviewing]] was read and applied | Read first: one round, improvement over harmlessness, findings minted as work. | reviewing.md |
| [x] | every hunk of git diff began..ended was read, and any not read is named | Those objects are absent, so four files were read on v4: hookserve.go, onedoorperfolder_test.go, the cage split, projections.json. The rest of squash da4e87b9 was not. | git show v4 |
| [x] | every criterion's command was run again, and what it said is named | Run on a clean HEAD copy. Both tests ok. The table goes red on all four rows when r.Work is hashed raw. After a mid-session restart, port 30268 still refused my calls. | fc-criteria.sh |
| [x] | every hunk improves the product, or a finding names the one that does not | Pass. One does not: the settings test passes with the door put back, so it cannot fail for its class. | wk-8d68a847cb |
| [x] | every finding is a trivial token naming this one, and their ids are here | wk-8d68a847cb. Also seen, already wk-0c3a3eed68: the backslash fold. |  |

