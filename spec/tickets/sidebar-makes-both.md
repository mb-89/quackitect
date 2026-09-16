---
kind: [[ticket]]
state: closed
urgency: soon
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
    needs: ["work test"]
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
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[spec/processes/standard]]
process_hash: 8cc8301e3ca3ba8d
group: the-sidebar-makes-both
step: verdict
record:
  - step: design/draft
    hand: box 1eeed4143ad0
    hash_before: 212a0a7ab9caac98ae47222084953409d432245f
    hash_after: 212a0a7ab9caac98ae47222084953409d432245f
  - step: design/review
    hand: box 1eeed4143ad0 · helper-2
    hash_before: f203cc868ba1cee1e91a2bda28a3524e6c32bb41
    hash_after: f203cc868ba1cee1e91a2bda28a3524e6c32bb41
  - step: implement/tests-red
    hand: box 1eeed4143ad0
    hash_before: 4bb61b1c8b1813113b8587ac3c5ddaea937a77ba
    hash_after: 4bb61b1c8b1813113b8587ac3c5ddaea937a77ba
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 1eeed4143ad0
    hash_before: fbaf9af3e5dc517639101f0aab0e4ae1ca7ff9b4
    hash_after: fbaf9af3e5dc517639101f0aab0e4ae1ca7ff9b4
    answered:
      - name: lint
        exit: 0
        said: 15 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box 1eeed4143ad0
    hash_before: b7b591624750d1df9f4241c023031128af30f9d4
    hash_after: b7b591624750d1df9f4241c023031128af30f9d4
    answered:
      - name: tests
        exit: 0
        said: green, 52 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: 15 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box 1eeed4143ad0 · helper-7
    hash_before: 067ec406304dc1250d1bc397f9e7447ff2781248
    hash_after: 067ec406304dc1250d1bc397f9e7447ff2781248
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The owner makes a vehicle or a stub from the sidebar, and the verbs behind the buttons stay the same ones the shell runs.

<!-- breaks, as text: what breaks if it is never done -->
The system stays a shell affair, and the owner opens a terminal for the one thing the sidebar is for.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- spec/config/level0.schema.json names two buttons, each with an icon the owner picks, beside the engine state
- a press asks for a folder and runs `./RUNME.sh vehicle into <folder>` or `./RUNME.sh stub into <folder>`
- the extension tests drive both buttons through the fake doors and read the command each runs
- spec/design_output/extension.md carries the two buttons

Read [[spec/design_input/a-stub-takes-its-vehicle]] first, the chapters The stub's files and The bridgehead step by step.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

Two action widgets in the schema, one field for the folder ask, and one door call behind it.

| piece | what changes |
|---|---|
| `spec/config/level0.schema.json` | `engine.vehicle` and `engine.stub`, each an `action` in the group `engine` at row 0, columns 0 and 1, with `asks` set to `folder` and `runs` carrying `<folder>` |
| `src/extension/sidebar.js` | a run message on an entry carrying `asks` asks the door for a folder first. The folder lands in `runs` in place of `<folder>`, in double quotes. A dialog closed on nothing ends the press there |
| `src/extension/editor.js` | `asks` opens the editor's folder dialog and answers the path, or the empty string |
| `test/level0/sidebar.test.js` | the fake door answers a folder, and the tests read the two commands and the closed dialog |
| `spec/design_output/extension.md` | the `asks` field, and a chapter on the two buttons |

- The group is `engine`, so the engine state lands beside the two buttons at column 2 when its mark arrives.
- The marks are placeholders the owner swaps in the schema: a truck for the vehicle, a seedling for the stub.
- The command runs in a terminal, the way the log button runs. So a refusal from the verb stands where the owner reads it.
- The sidebar reads `asks` off the schema by the message's key. So the panel and the webview stay as they stand.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- Each line of the ask lands on one row of the table, and the row names its file.
- The schema declares the two actions, and the sidebar reads `asks` off it by key.
- `editor.js` alone reaches the folder dialog, and the fake door answers the folder in the tests.
- The command runs through the terminal door the log button runs through.
- A closed dialog ends the press, so nothing runs on an empty folder.

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

Five tests fail, and each fails on the line I expect. The three sidebar tests find the door asked for nothing, because the run message goes straight to the terminal. The two contract tests find no `engine.vehicle` in the declaration on disk. The fourth sidebar test passes at once, because the in-memory schema already draws the two buttons through the panel as it stands. That surprises me: the drawing needs no change, and the whole of the work sits in the sidebar, the door and the declaration.

### checked

- the tests touch the sidebar test and one contract test over the declaration. The change ahead touches the schema, the sidebar, the editor door and the design output
- the folder dialog is one call on the editor door, and the fake door in the sidebar test answers it
- each test carries a link to the chapter the design output takes on the two buttons

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

- the change touches the schema, the sidebar, the editor door, the design output and the two tests. The ask's own line took code spans around its two commands, so the rules pass
- the folder dialog is one call on the editor door, `asks`, and the fake door answers it
- the sidebar, the door and both tests each carry a link to the chapter Two buttons make both

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

Two action buttons stand in a section named `engine` in the sidebar. One runs the vehicle verb, one the stub verb, each over a folder the owner picks in the editor dialog. The declaration grows one field, `asks`, and the sidebar reads it by the key a run message carries. The editor door grows one call, `asks`, which opens the dialog and answers the path or the empty string. An empty answer ends the press, and the log takes no line.

The verbs stay the ones the shell runs, in a terminal, so a refusal from a verb stands where the owner reads it. The contract test over the tree now counts seven drawn controls, and a new contract test reads the two entries off the declaration. The second line of the ask took code spans around its two commands, so the rules pass over the tree.

### checked

- the change touches the schema, the sidebar, the editor door, the design output and three tests
- the folder dialog is one call on the editor door, and the fake door answers it
- the sidebar, the door and the tests each link the chapter Two buttons make both

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

spec/config/level0.schema.json
spec/design_output/extension.md
spec/tickets/sidebar-makes-both.md
spec/tickets/the-sidebar-makes-both.md
src/extension/editor.js
src/extension/sidebar.js
test/contract/sidebar.test.js
test/contract/tree.test.js
test/level0/sidebar.test.js
spec/guidance/review/reviewing.md
spec/design_input/a-stub-takes-its-vehicle.md
src/extension/webview/clicks.js
src/scripts/cli.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass
- The schema declares `engine.vehicle` and `engine.stub` as actions in the group `engine`. Each wears a mark, and `asks` set to `folder`.
- A press asks the door for a folder, and runs the vehicle verb or the stub verb over it.
- The line runs in a terminal, the way the log button runs, and both verbs stand in the cli.
- The sidebar tests drive both buttons through the fake door, and read the command each runs.
- A dialog closed on nothing runs nothing and writes no log line, and a test proves it.
- The design output carries the `asks` field and the chapter Two buttons make both.
- `./RUNME.sh branch test` answers green.
- `./RUNME.sh check` exits 0, with placeholder warnings the check allows.
- The group ticket's state and step change by the verbs at the take, and redesign nothing.
- The tree contract test counts the two new drawn controls, a trivial follow of the schema.
- The branch adds no rule, so it owes no rule test.
- No retro stands in the handback yet, and the retro step follows this one.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
