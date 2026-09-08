---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a prompt logs itself
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: level0
# tokens that have to close before this can start
depends_on:
  - "[[wk-5d193fcbc1]]"
---

## detail

A prompt reaches the record only if the engine is up and answers. When it is not, no line is written and nothing says one is missing.

MEASURED on session.jsonl, 2026-09-08. At 11:18:13 the person asks "I asked you to write a note. I don't see it in the log." At 11:18:44 the agent answers "No, I had not written it when you asked" — so the request was made. NO PROMPT LINE IN THE WHOLE SESSION ASKS FOR A NOTE. The request is absent from the record.

The window it fell in: the engine swapped at 10:51:45. Between 10:51:48 and 11:17:29 the log holds four lines, two of them engine bookkeeping, and no prompt, no call and no stop for 26 minutes.

BOTH prompt hooks need the engine. The travelling cage spawns node and talks to it; the local cage POSTs to its port. Neither reports its own failure, and UserPromptSubmit has a 30 second timeout rather than 600.

A LOG THAT CANNOT SEE ITS OWN GAPS IS NOT A RECORD. A missing line is indistinguishable from a prompt nobody typed, which is why this went unnoticed until a person compared what he remembered with what the log holds.

## approach

The module writes the prompt line to disk itself at `prompt.submit`, with `$.fs`, and the engine ingests it. Writing the record is not state and not a rule: the log is level zero by ruling, and level zero is what the module is.

So the engine leaves the critical path for RECORDING that a prompt happened. It stays on the path for deciding anything about it.

Where the module cannot write, the failure is written rather than swallowed: a line saying the line could not be written is worth more than silence.

## done when

- a prompt typed while no engine answers is in the record: stop the engine, type, and read the line back
- a prompt typed during a swap is in the record: swap and type in the same window, and read the line back
- a write that fails leaves a line saying so: force the write to fail and read the refusal
- the count of prompt lines matches the harness transcript for one whole session: a script that reads transcript_path, which the engine is already handed on every hook, and names every prompt with no line

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | the record stops depending on the thing it is recording, so a gap becomes visible instead of invisible | the measurement in the detail |
| [x] | what breaks if it is never done, and not only that it stays undone | prompts keep vanishing in exactly the windows that matter, and nobody can tell a lost line from a quiet minute | the 26 minute window after the swap |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | the approach names who writes, with what, and what happens when the write fails | the approach section |
| [x] | every done-when line is decidable, and names the command where one decides it | each line names a thing to do and a line to read back | the done when section |
| [x] | the change is small enough to review whole, or it is split first | one hook and one writer | the approach section |
| [x] | the basics it stands on exist, or are minted first | the module exists first, which is why this depends on that token. transcript_path is already on every hook payload at hook.go:72 | src/engine/hook.go |

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
