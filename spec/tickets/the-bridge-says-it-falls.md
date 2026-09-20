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
step: design/draft
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

fail

- `seen` asks the server before `starts` runs, so every cloud session start draws a chat line
- the draft scopes itself to a fall under a running session, and the change reaches the session start too
- the case table wants a row for the session start, or `down` wants a guard on that event
- line 47 of `spec/design_output/level0.md` carries the claim the change overturns, and the change table leaves it out
- line 96 of that chapter reads the first cloud event as a log row alone, so it drifts too
- `saidDown` takes the answer of `wrote`, so a failing log write repeats the line each event
- what stands: `serverLine` answers `none at <the health call>`, and `doctor` prints it under `server`
- the tree holds that doctor wording in the code alone, so the plan's case earns its place
- the `$.ui.log` route matches `says` in the level one hook, so the helper shape holds
- `./RUNME.sh check` answers 0 on this branch, and the retro stands absent

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
