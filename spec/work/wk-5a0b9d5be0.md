---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the local cage goes
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: level0
# tokens that have to close before this can start
depends_on:
  - "[[wk-5d193fcbc1]]"
---

## detail

The twelve per-call events go over HTTP to `127.0.0.1:<derived port>` because a hook is a foreign process. In a module they are neither foreign nor a process.

What that costs today: the cage is two files rather than one. `.claude/settings.local.json` holds the events and the port, is not in version control because the port is derived from the folder path, and the tracked file carries a paragraph explaining why the pair exists. One box committed a port once and every other box rewrote it before doing anything.

With the events in the module: one cage file, and it travels. No port, no local file, no paragraph.

THE DOOR STAYS AND THE PORT LEAVES THE CAGE. [[wk-1dbf235c91]] makes that door the engine's one entry, and the engine writes its port under .se where every client reads it at run time. So what goes is the local settings file, not the transport.

## approach

Each event registered in the local cage becomes a hook in the module, taking the same decision by asking the engine, so nothing about the rules changes here.

Then the local file, its source and its projection entry go, and the port derivation moves from the cage to a file the engine writes under .se. The wake stays a command in the travelling cage, because it is what brings the engine up and cannot live in a file the engine writes.

THIS IS THE ONE DELETION THAT BITES MID-TURN. The harness reloads hooks when a settings file changes, so the moment the local cage goes the running session loses its per-call guards and its log. So it is the LAST act: the events land in the module and are pushed, then the file goes, then the turn ends. The next session comes up guarded by the module. Nothing is removed before the module probe is green on this box.

`g_the_travelling_cage_cannot_block.go` guards a cage that then carries only the wake. Whether it is corrected or retired is decided here and written on the token, not assumed.

## done when

- the module probe was green on this box before anything was removed: the script's own answer, quoted
- every event the local cage registers today is taken by the module, and refuses the same calls: a test driving each event through both paths and comparing
- there is one cage file: `.claude/settings.local.json` and its source are absent, and `se --project` does not write them
- no port appears in any settings file, and a client with no port finds one: a search that answers nothing, and a test that reads the file under .se
- a box with no engine is still refused nothing: the travelling cage carries the wake and no other event
- the local cage was deleted last, and the turn ended after it: the log's own order for this session
- the tree is sound: `sh util/checks/battery.sh` is green

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | the cage becomes one file that travels, and the per-machine number that made two files necessary stops existing | src/cage/claude-settings.json, its own comment |
| [x] | what breaks if it is never done, and not only that it stays undone | every clone keeps rewriting a port before it can work, and the two-file cage keeps needing a paragraph to explain itself | the comment names a box that committed 33987 and a clone that bound 30268 |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | the approach moves the events first and removes the transport second, and names the wake as the exception | the approach section |
| [x] | every done-when line is decidable, and names the command where one decides it | each line names a test, a listing, a search or the battery | the done when section |
| [x] | the change is small enough to review whole, or it is split first | twelve events and one transport, reviewable whole | the approach section |
| [x] | the basics it stands on exist, or are minted first | the module exists first, which is why this depends on that token | the depends_on field |

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
