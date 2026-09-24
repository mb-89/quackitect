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
group: the-ticket-answers-the-editor
depends_on: [yours-counts-the-waiting]
step: design/review
record:
  - step: design/draft
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: b457f4514cd785e6e7ffc5305a8a17674111b93f
    hash_after: b457f4514cd785e6e7ffc5305a8a17674111b93f
  - step: design/review
    hand: box 2bc65ec92430 · claude-code-remote · helper-2
    hash_before: ea8a28f96918911aeeeb8b26cb3cb51a06bcb7e4
    hash_after: ea8a28f96918911aeeeb8b26cb3cb51a06bcb7e4
    returns: 1
    why: A `work` section holds the knobs already, so the buttons join it and keep every knob.; New ticket declares no `runs`, so a press in the sidebar today runs an empty line.; Pull for me runs `ticket yours --next`, which names a ticket and pulls nothing.; Name the `sidebar.js` change that reads `opens` and `counts`, or the press each button makes today.; The config case holds each button to a ticket verb, yet the work editor runs `tui work`.
  - step: design/draft
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: c07fe154e79124c18e584246b25ac96f500cf273
    hash_after: c07fe154e79124c18e584246b25ac96f500cf273
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The config schema declares only what a person sets, and the work group gives the sidebar its buttons.

The sidebar keeps keys no code reads, and the work group has nowhere to declare its buttons.

- engine.state and engine.beat stand nowhere in spec/config/level0.schema.json
- the schema declares a work group whose buttons run the verbs the editor calls
- ./RUNME.sh test test/level0/config.test.js passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Two edits to `spec/config/level0.schema.json`, and the tests that read the declaration follow.

| the edit | what changes |
|---|---|
| the engine keys leave | `engine.state` and `engine.beat` go, and the `engine` comment drops its line on widgets nothing draws |
| the buttons join `work` | the section standing already keeps every knob, and gains three action widgets |

Each button stands declared and undrawn: it carries no `group`. The sidebar draws a widget with a group at once, and it runs `runs` in a terminal. The host the desk group builds reads `opens` and `counts`, and its work group child adds the group. So no button draws a press that does nothing today.

| the key | the button | what it declares |
|---|---|---|
| `work.editor` | the work editor | `runs` `./RUNME.sh tui work`, and `counts` `./RUNME.sh ticket yours --count` |
| `work.pull` | pull for me | `runs` `./RUNME.sh ticket yours --next`, whose ticket the host pulls and opens |
| `work.new` | new ticket | `asks` a name, and `opens` the file under `spec/tickets` it names |

| the test | the change |
|---|---|
| `test/contract/tree.test.js` | the undrawn list holds the three work buttons, and the drawn list stays |
| `test/contract/sidebar.test.js` | the vehicle and the stub share a section with each other |
| `test/level0/sidebar.test.js` | the title drops the engine state |
| `test/level0/config.test.js` | one case says the engine keys stand nowhere, and one says each `runs` and `counts` names a verb the command line knows |

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/extension/lib/widgets.js` `drawnIn` and `groupsIn`, which draw the new group unchanged
- `src/extension/sidebar.js` the button message, which runs `runs` unchanged
- `test/contract/tree.test.js` and `test/contract/sidebar.test.js`, which read the declaration


### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- a `work` section stands already: the buttons join it, and every knob stays
- new ticket runs nothing: no button carries a group, so none draws before the host reads it
- pull for me pulls nothing: the host pulls the ticket `yours --next` names, and the button draws with the host
- the sidebar reads neither new key: the desk group's host reads them, and adds the group
- the work editor runs no ticket verb: the case checks each line names a verb the command line knows


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- A `work` section holds the knobs already, so the buttons join it and keep every knob.
- New ticket declares no `runs`, so a press in the sidebar today runs an empty line.
- Pull for me runs `ticket yours --next`, which names a ticket and pulls nothing.
- Name the `sidebar.js` change that reads `opens` and `counts`, or the press each button makes today.
- The config case holds each button to a ticket verb, yet the work editor runs `tui work`.

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
