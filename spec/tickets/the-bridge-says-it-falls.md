---
kind: [[ticket]]
state: open
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
group: the-bridge-keeps-transport
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/tests-green
record:
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 27b0904e1fc84e945c95bddb1f312515280534dd
    hash_after: 27b0904e1fc84e945c95bddb1f312515280534dd
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote · helper-15
    hash_before: 78f9a22d83b1eafd9aae8b88d1376cf6e2f9764e
    hash_after: 78f9a22d83b1eafd9aae8b88d1376cf6e2f9764e
    returns: 1
    why: "`seen` asks the server before `starts` runs, so every cloud session start draws a chat line; the draft scopes itself to a fall under a running session, and the change reaches the session start too; the case table wants a row for the session start, or `down` wants a guard on that event; line 47 of `spec/design_output/level0.md` carries the claim the change overturns, and the change table leaves it out; line 96 of that chapter reads the first cloud event as a log row alone, so it drifts too; `saidDown` takes the answer of `wrote`, so a failing log write repeats the line each event; what stands: `serverLine` answers `none at <the health call>`, and `doctor` prints it under `server`; the tree holds that doctor wording in the code alone, so the plan's case earns its place; the `$.ui.log` route matches `says` in the level one hook, so the helper shape holds; `./RUNME.sh check` answers 0 on this branch, and the retro stands absent"
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 9463ea56e738a5dbf2ef5c90ef8c03697a14bbcf
    hash_after: 082a68b85767412d83494d654eab1d63124e67be
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote · helper-16
    hash_before: 562f827de25561435449745593ea62240a5a4f14
    hash_after: 562f827de25561435449745593ea62240a5a4f14
  - step: implement/tests-red
    hand: box fa49097ce66c · claude-code-remote
    hash_before: c70d7de95312964e098d50009d62b980d410a053
    hash_after: ed281d10da5fb41e8e7a8e0b1a24034b64a14be9
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box fa49097ce66c · claude-code-remote
    hash_before: bfc3c8551749549fe5e1c3974b5d78f0970645b3
    hash_after: d8db1c28accde551de53a65c310d505b5d173548
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 846ba6b31a0b588f40b3fc9d05e466c5104075a9
    hash_after: 809501d4f70de537049dd50d35e5efb2e365fc0b
    answered:
      - name: tests
        exit: 0
        said: green, 397 test(s) pass in 37 file(s); green, src/engine/swap passes
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box fa49097ce66c · claude-code-remote · helper-17
    hash_before: fe502d4fea13df7b613b5f7603b26fd3628dfc82
    hash_after: fe502d4fea13df7b613b5f7603b26fd3628dfc82
    returns: 1
    why: "the ask lands: `down` says one line in the chat, and `doctor` names a bridge standing down; `url()` answers the event route, and line 176 of the bridgehead chapter calls it the health call; line 180 of that chapter repeats the health call wording, and the hook names the event route; the tree reads the health call as `/health` at lines 228, 235 and 238 of that chapter; fix: name the event route at both lines, so a reader of the chapter reads the code; the case over a failing session log asserts one chat line, which `toldDown` holds alone; a probe reverting the flag move keeps that case green, and the row writes go 2 to 4; so the flag move answering finding six carries no case proving it fires; fix: add a case counting the rows a failing log takes, one a fall; `spec/design_output/extension.md` line 341 says a dead server leaves the agent running the same; the change gives that agent a chat line, and the pointer under line 341 reaches the old chapter; fix: correct line 341, and point it at the chapter this branch adds; the session start case and the once case each break under a mutant, so both guards hold; the diff reaches six files, and `serverLine(get = fetch)` opens the doctor to a fake door; `./RUNME.sh check` answers 0 on this branch; `./RUNME.sh branch review` reads the retro as absent from the handback; a local box running no server draws the line at its first `prompt.context`; the cage chapter's code 3 reasoning covers the block alone, so that silence holds"
  - step: implement/reflect
    hand: box fa49097ce66c · claude-code-remote
    hash_before: b0ff40d4a6f0ba71d5ab28a8dcc9c5e36be20d31
    hash_after: 202d385b0831748f52ef99d2bf2557d237fb6284
  - step: implement/change
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 42a1d589d8ec62009bf62661d7fa6f3ad384d1d9
    hash_after: b689a36ba3cc53131eb05f93878e552c7e33a158
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
---

# Ask

a hand learns the bridge fell at the moment it falls

doors pass quietly for minutes, and the check finds it later

- the hook writes a line to the chat when the server answers nothing
- the doctor names a bridge standing down

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

- one line to the chat where the server stops answering
- one case over the bridgehead's fall road
- one case over the doctor's line, which reads right already

**What stands.** `down` in `hooks/level0.js` writes one `warn` row to the
session log and carries on. `saidDown` holds it to one row a fall, and the
answer of a server clears that flag. So a second fall says so again.

| who learns of a fall | how |
|---|---|
| the session log | one `warn` row |
| `./RUNME.sh doctor` | `none at <the health call>`, when a person asks |
| a person watching | the row, once they open that file |

**The gap.** A row in a file nobody opens reaches nobody. The doors then pass
quietly, and the check finds the fall minutes later.

[[spec/tickets/the-session-says-its-cage]] carries the same shape at another
moment. That one covers a server standing down at the session start, and this
one covers a server falling under a running session.

**The session start says nothing.** `seen` posts every event to the server
first, and runs the start road under a `session.start` the server answers
nothing for. So that one event answers nothing on a healthy cloud box, by
design.

| the event | what the silence means |
|---|---|
| `session.start` | the start road stands ready to run, and the server starts under it |
| every other event | the bridge falls, or stands down |

A chat line at the session start reads false on every healthy cloud start. So
the line skips that event, and [[spec/tickets/the-session-says-its-cage]]
carries the moment with its own block.

**The change.** `down` says it where a person stands, beside the row it writes.

| what changes | where |
|---|---|
| `down` writes one line through the harness log | `hooks/level0.js` |
| that line skips `session.start`, which the start road follows | the same file |
| the line names the health call and the two commands | the same file |
| a helper wraps that write, because a harness carrying no such door throws | the same file |
| the row of the answer table naming one `warn` line | the bridgehead chapter |
| the paragraph naming the first event's silence | the start road chapter |

The hook reaches the person through `$.ui.log`, the way the level one hook
says its own lines. A harness offering no `$.ui` leaves the row in the session
log, and nothing throws.

**What `saidDown` holds.** It takes the answer of the session-log write today,
so a box whose log write fails repeats the chat line at every event. The flag
moves off that answer, and a failing row leaves the chat line paid.

**The cases.** Each goes over a fake harness, so no door runs live.

| the case | what it reads |
|---|---|
| the server answers nothing at `session.start` | the row alone, and no chat line |
| the server answers nothing at a later event | one chat line naming the health call |
| the server answers nothing twice | one line, because `saidDown` holds it |
| the server answers, then falls | a second line, because the answer clears the flag |
| a harness carrying no `$.ui` | the row alone, and no throw |
| a session-log write that fails | one chat line, because the flag stands off that answer |

**The doctor.** The second line of the ask reads as met. `serverLine` answers
`none at <the health call>` where nothing answers, and `doctor` prints it under
`server`. The case holds that wording, so a later change says so.

**What this leaves.** A fall between two calls of one turn reaches the person
at the next call, and no sooner. The bridgehead speaks where an event reaches
it, so a quiet stretch stays quiet. A watcher polling the health call is its
own ticket, and this one mints none.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- `seen` asks the server before `starts` runs, so the skip at `session.start` answers the first three findings
- the change table names the answer table row and the start road paragraph, so findings four and five hold
- `saidDown` takes the answer of `wrote`, and the draft moves the flag off it, so finding six holds
- `serverLine` answers `none at <the health call>`, and `doctor` prints it under `server`
- the tree holds that doctor wording in the code alone, so the draft's case earns its place
- `says` in the level one hook wraps `$.ui.log` in a catch, so the helper shape holds
- the start road harness offers `$.ui` nowhere, so the draft's quiet case holds
- the two doc rows name a chapter each, and leave the file `spec/design_output/level0.md` out
- the hook's route and the doctor's route differ, and the draft calls both the health call
- the case table leaves out the doctor case the prose names twice
- the line names two commands, and the draft leaves which two to the cage block wording
- a caged cloud box draws the line at its first `prompt.context`, beside the cage block the same event carries
- the draft touches the ticket file alone, so the diff stands inside the brief
- `./RUNME.sh check` answers 0 on this branch, and the retro stands absent from the handback

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Six cases stand in `test/level0/start-road.test.js`, and four fail on their
own assertion.

| the case | what it reads |
|---|---|
| a fall at a later event | one chat line, and the chat stands empty |
| the session start | no chat line, which holds today |
| two events answering nothing | one line, and the chat stands empty |
| a server answering, then falling | a line after the fall, and the chat stands empty |
| a harness carrying no chat log | the row alone, which holds today |
| a session log taking no write | one line, and the chat stands empty |

The two passing cases guard the road. The session start draws nothing today
because nothing draws anything, so that case turns green the moment the guard
lands wrong.

**What surprises.** The harness of this file offers the bridgehead a wire, a
file system and a process, and no chat log at all. So the road the ask wants
has nobody to speak to under a case until the fake grows one.

The fake grows a chat log and a switch that takes the server down mid-run. That
switch is what reads a fall apart from a server standing down from the start.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases reach the one test file holding this road, and nothing else changes
- the bridgehead meets a fake wire, a fake file system and a fake chat log
- a comment over each case points at this ticket, which carries the approach

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

**The class.** A claim written from what a name suggests, in place of what the
code answers. The three findings each read that way.

| the finding | what the name suggests | what the code answers |
|---|---|---|
| the chapter calls the posting route the health call | a health call, because the chapter names one nearby | `url()` answers `/event` |
| the failing-log case reads as proof of the flag move | the case names the flag, so it holds the flag | the case passes under the old flag too |
| the overturned claim stands in one note | one note carries it, because the change reaches one | a second note carries it as well |

**The fix for the class.** A claim about the code earns a run, and a case
earns a mutation.

- read the value a name answers before writing what it holds
- put the old line back under a case, and keep the case where it turns red
- search the tree for the claim a change overturns, past the note the change opens

The second of those is what the verdict itself does. It reads a case green
under the old line, and a case a mutation leaves green tests the test.

The change takes that road. The chapter names the route the code answers, the
case counts what the flag holds, and the second note follows the claim.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the fix reaches the chapter, the case and the second note, each named by the verdict
- the case counts the writes the fake takes, so the fake carries that count
- each line points at the chapter owning the road, which carries the approach

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change reaches the bridgehead, its cases, and the chapters naming the old claim
- the bridgehead meets a fake wire, a fake file system and a fake chat log
- the chapter The bridge says it falls carries the road, and each new line points there

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A person learns the bridge stands down at the moment it does, where they
stand.

| what the bridgehead does | when |
|---|---|
| writes one `warn` row naming the health call | the first event the server answers nothing for |
| says one line through the harness log | the first such event past the session start |
| drops both marks | the server answers again |

The line names the health call, what the wire says, and the two commands a
person runs. A harness offering no such log leaves the row alone.

- `seen` posts the event first and runs the start road under it
- so a healthy cloud start answers nothing at `session.start` by design
- a line at that moment reads false on every such start, and the line skips it

Two marks stand apart. One holds the row, and one holds the chat line. A
session start writing the row leaves the line unsaid, so the fall at the next
event still reaches the person.

The row's mark stands off the answer of the write, so a log taking no write
leaves the line paid. `serverLine` takes the fetch as a door now, so a case
holds the doctor's wording where a person asks after a fall later.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change reaches the bridgehead, the doctor's line, their cases, and the chapters naming the claim
- the bridgehead meets a fake wire, a fake file system and a fake chat log
- the chapter The bridge says it falls carries the road, and each new line points there

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- .claude/skills/level0/hooks/level0.js
- .claude/skills/level1/hooks/level1.js
- spec/design_output/extension.md
- spec/design_output/level0.md
- spec/design_output/vehicle.md
- spec/guidance/review/reviewing.md
- spec/tickets/the-answer-door-reads-chat.md
- spec/tickets/the-bridge-says-it-falls.md
- src/scripts/cli-check.js
- test/level0/check-server.test.js
- test/level0/start-road.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail

- the ask lands: `down` says one line in the chat, and `doctor` names a bridge standing down
- `url()` answers the event route, and line 176 of the bridgehead chapter calls it the health call
- line 180 of that chapter repeats the health call wording, and the hook names the event route
- the tree reads the health call as `/health` at lines 228, 235 and 238 of that chapter
- fix: name the event route at both lines, so a reader of the chapter reads the code
- the case over a failing session log asserts one chat line, which `toldDown` holds alone
- a probe reverting the flag move keeps that case green, and the row writes go 2 to 4
- so the flag move answering finding six carries no case proving it fires
- fix: add a case counting the rows a failing log takes, one a fall
- `spec/design_output/extension.md` line 341 says a dead server leaves the agent running the same
- the change gives that agent a chat line, and the pointer under line 341 reaches the old chapter
- fix: correct line 341, and point it at the chapter this branch adds
- the session start case and the once case each break under a mutant, so both guards hold
- the diff reaches six files, and `serverLine(get = fetch)` opens the doctor to a fake door
- `./RUNME.sh check` answers 0 on this branch
- `./RUNME.sh branch review` reads the retro as absent from the handback
- a local box running no server draws the line at its first `prompt.context`
- the cage chapter's code 3 reasoning covers the block alone, so that silence holds

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the chapter owns the road, each new comment points at it, and two lines name the wrong route

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
