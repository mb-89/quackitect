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
step: verdict
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
  - step: design/draft
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: 63c8237d4219b03cff26cf91612212a0dcdb2355
    hash_after: 63c8237d4219b03cff26cf91612212a0dcdb2355
  - step: design/review
    hand: box 75b31b3d5012 · claude-code-remote · helper-4
    hash_before: 8c9139f117ba30c7bd944982774bc484bae6d6fb
    hash_after: 8c9139f117ba30c7bd944982774bc484bae6d6fb
  - step: implement/tests-red
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: fbf3199065c344a5c0e0aed093c03de3c27aef69
    hash_after: fbf3199065c344a5c0e0aed093c03de3c27aef69
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: 12e14e40c596243c4e7546f3608aab2c004c7922
    hash_after: 12e14e40c596243c4e7546f3608aab2c004c7922
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 75b31b3d5012 · claude-code-remote
    hash_before: c061d7112c22b13e520cde42b0f0c5a908dd8fe8
    hash_after: c061d7112c22b13e520cde42b0f0c5a908dd8fe8
    answered:
      - name: tests
        exit: 0
        said: green, 45 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: The rules pass.
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
| the tests | `test/level0/lens.test.js` | the choice over a picked process, a standing route and an empty `process`, and `saved` over a fake door |
| the road | `test/level0/save-fills.test.js` | `saved` over a door whose `runsVerb` runs the `ticket` verb over the fake disk `ticket-fill.test.js` builds, and the saved file carries `steps`, `process_hash` and a chapter per step |

The wire calls `door.onSave?.`, so the fake door `doorOf` in `test/level0/sidebar.test.js` stays as it stands. The fill writes the file on disk. The editor reloads a saved file it holds clean, so the person meets the route and the chapters. The progress title of `runsVerb` names the verb it runs, in place of a fixed `ticket pull`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/extension/extension.js`, `activate`, which wires the save
- `src/extension/lib/lens.js`, `ticketLensOf().took`, which calls `door.runsVerb`
- `src/extension/editor-lens.js`, `runsVerb`, whose title changes for `took` and `saved` alike
- `test/level0/lens.test.js`, the fake door behind `ticketLensOf`
- `test/level0/sidebar.test.js`, `doorOf`, the fake door `activate` takes, which carries no `onSave`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- the design finding on the route and chapters: `test/level0/save-fills.test.js` runs the verb over a fake disk
- the craft finding on `doorOf`: the wire calls `door.onSave?.`, and the callers list names the fake
- the craft finding on `runsVerb`: the callers list names it

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

| grade | finding | fix |
|---|---|---|
| ask | the three done lines map to `fillArgvOf` over a picked process, a standing route and an empty `process`, and `ticket fill` holds the mint's road | none |
| answers | the three findings of the earlier review each carry an answer: `save-fills.test.js`, `door.onSave?.` with `doorOf` named, and `runsVerb` named | none |
| craft | the wire in `activate` carries no test, so a save that skips `saved` passes every test named | add a test in `test/level0/sidebar.test.js` that sets `door.onSave` and asserts it gets `tickets.saved`, the way the lens test reads `door.lenses` |
| craft | a blank line splits the approach table, so the rows `the tests` and `the road` fall outside it | drop the blank line above `the tests` |

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh test test/level0/lens.test.js test/level0/save-fills.test.js test/level0/sidebar.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

A stub `fillArgvOf` and `saved` leaves these cases red: the fill over a picked process, the run of `saved`, the road through the verb, and the wire in `activate`. The cases on a standing route and an empty `process` stand green on the stub, since both answer nothing. The lens test imports a CommonJS module, so a missing export fails the whole file on import. The stub moves that failure onto the assertions.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch the lens, its tests, the sidebar test and one new test file, and the approach names each
- the road runs the verb over `fakeDisk`, and the lens cases run over the fake door the lens test builds
- `save-fills.test.js` and each new case name the design input's heading on a ticket picking a process

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

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the lens, the lens door, the start and the tests the approach names
- the save reaches `runsVerb`, which the lens test and `save-fills.test.js` fake
- `fillArgvOf`, `saved`, `onSave` and the wire each name the design input's heading on a ticket picking a process

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh test test/level0/lens.test.js test/level0/save-fills.test.js test/level0/sidebar.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A save of a ticket in the editor now runs `./RUNME.sh ticket fill` where the ticket names a process and carries no route. So a person picks a process, writes the ask, saves, and meets the route and a chapter per step. The fill writes through the mint, so one road writes a route. A save over a standing route or an empty `process` runs nothing. A refused fill raises a warning, and the log holds the verb's answer.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change stays inside the lens, the lens door, the start and their tests
- `runsVerb` carries a fake in the lens test and in `save-fills.test.js`
- each new function names the design input's heading on a ticket picking a process

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
