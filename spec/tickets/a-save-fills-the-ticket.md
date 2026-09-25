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
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
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
process: [[spec/processes/standard]]
process_hash: 7a1a6e274b56e7ee
group: the-editor-holds-the-drawing
depends_on: [the-ticket-answers-the-editor]
step: design/draft
record:
  - step: design/draft
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: e2aab03f1ba38256155aa62fc11a14fdf9ed669a
    hash_after: e2aab03f1ba38256155aa62fc11a14fdf9ed669a
  - step: design/review
    hand: box 75b31b3d5012 · claude-code-remote · helper-2
    hash_before: 9ba488747341f372a9b4a6eac6c23938ff5b4678
    hash_after: 9ba488747341f372a9b4a6eac6c23938ff5b4678
    returns: 1
    why: "| grade | finding | fix |; |---|---|---|; | design | the fake `runsVerb` in `test/level0/lens.test.js` stops at the argv, so no test named proves a save writes the route and chapters, which the first line of the ask calls for | name the test that runs `ticket fill` on the saved path over a fake disk and asserts `steps`, `process_hash` and a chapter per step |; | craft | `activate` in `src/extension/extension.js` gets the fake door `doorOf` in `test/level0/sidebar.test.js`, which carries no `onSave`, and the callers list leaves it out | name `sidebar.test.js`, `doorOf` as a caller, and say whether the wire calls `door.onSave?.` or the fake gains `onSave` |; | craft | `saved` calls `door.runsVerb` as a second caller, and the title change reaches `took` too | name `src/extension/editor-lens.js`, `runsVerb` in the callers list |"
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A person picks a process, writes the ask and saves, and the file fills with its route and a chapter per step. The save calls the code the mint calls, so one road writes a route. The plan stands in [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]].

Without it a person minting a ticket leaves the editor for the terminal, and level one stays open.

- a save over a picked process and an empty route writes the route and chapters, and a test drives it
- a save over a ticket whose route stands writes nothing, and a test drives it
- a save over a ticket with an empty `process` writes nothing, and a test drives it
- `./RUNME.sh check` passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The save rides the lens's own road, so the test holds it with no editor.

| part | file | what it does |
|---|---|---|
| the choice | `src/extension/lib/lens.js`, `fillArgvOf(path, text)` | answers `ticket fill <path>` where the path names a ticket, `process` holds a value and `stepsIn` finds no step, and answers nothing otherwise |
| the run | `src/extension/lib/lens.js`, `ticketLensOf(door).saved(path, text)` | runs the line through `door.runsVerb`, writes the answer to the log, and warns on a refusal |
| the hook | `src/extension/editor-lens.js`, `onSave(run)` | hands every save under the ticket folders to `run` |
| the wire | `src/extension/extension.js`, `activate` | hands `tickets.saved` to `door.onSave` |

The fill writes the file on disk. The editor reloads a saved file it holds clean, so the person meets the route and the chapters. The progress title of `runsVerb` names the verb it runs, in place of a fixed `ticket pull`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/extension/extension.js`, `activate`, which wires the save
- `src/extension/lib/lens.js`, `ticketLensOf().took`, which calls `door.runsVerb`
- `test/level0/lens.test.js`, the fake door behind `ticketLensOf`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

| grade | finding | fix |
|---|---|---|
| design | the fake `runsVerb` in `test/level0/lens.test.js` stops at the argv, so no test named proves a save writes the route and chapters, which the first line of the ask calls for | name the test that runs `ticket fill` on the saved path over a fake disk and asserts `steps`, `process_hash` and a chapter per step |
| craft | `activate` in `src/extension/extension.js` gets the fake door `doorOf` in `test/level0/sidebar.test.js`, which carries no `onSave`, and the callers list leaves it out | name `sidebar.test.js`, `doorOf` as a caller, and say whether the wire calls `door.onSave?.` or the fake gains `onSave` |
| craft | `saved` calls `door.runsVerb` as a second caller, and the title change reaches `took` too | name `src/extension/editor-lens.js`, `runsVerb` in the callers list |

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
