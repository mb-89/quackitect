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
status: open
claimed_by: 542bcda8/main
claimed_at: "2026-09-04T18:47:54Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ee54932f7938aaf3c47895b1b42dae6f8e7dc74c
---

## detail

THE CLASS IS WRITING DOWN SOMETHING EPHEMERAL.

A port is valid only while the process that opened it lives. A settings file is read once and is meant to outlive any run. Write the first into the second and it is stale by design. The port is this instance, not the rule.

WHAT HAPPENED. The engine picks a hook port at start and writes it into .claude/settings.json. The harness reads that file once, when the session begins. A restart moves the port, and the session goes on knocking at a door that died.

MEASURED. The engine was restarted mid-session. engine.json and settings.json both name port 39056. This session still posts to 32112. A Bash call of echo probe went straight through, where the same call was refused before the restart. Every guard rides on that door, so all of them were absent and nothing said so.

## proposed action

The port is not written down anywhere.

The settings name a door that cannot move: a command, rather than a URL carrying a port. The command reads the live engine out of .se/engine.json when it is called. That is where ephemeral state belongs, and it is already there.

A command costs a process per tool call, which the comment above the hooks rejects on purpose. Weigh that against what it bought today. Every guard was absent for an hour and nothing said so.

A check keeps the class shut rather than this one instance. An engine start leaves the settings file byte for byte as it was.

## done when

- an engine start writes nothing into .claude/settings.json: a Go test in src/engine starts it twice over one tree and asserts the file is unchanged, byte for byte
- .claude/settings.json carries no port and no run id: node util/checks/no-ephemeral-in-settings.mjs . answers 0 failed
- that check is watched red against a settings file carrying a port, and the red run is named in the evidence
- a call is still guarded after a mid-session restart: restart the engine, then run a Bash command the guard refuses. It is refused again

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
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

