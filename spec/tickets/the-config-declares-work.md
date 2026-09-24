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
step: verdict
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
  - step: design/review
    hand: box 2bc65ec92430 · claude-code-remote · helper-4
    hash_before: 1187943e82a7c89dfe3ac40a6718da3f1e298883
    hash_after: 1187943e82a7c89dfe3ac40a6718da3f1e298883
  - step: implement/tests-red
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 9a633c5d89fd375a49ca09224b984b7ec490c5e5
    hash_after: 9a633c5d89fd375a49ca09224b984b7ec490c5e5
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 94b0607e8263c437442729289fc9d0004119fba7
    hash_after: 94b0607e8263c437442729289fc9d0004119fba7
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 2243435bfaae091794910b60c2810c452481fcc8
    hash_after: 2243435bfaae091794910b60c2810c452481fcc8
    answered:
      - name: tests
        exit: 0
        said: green, 79 test(s) pass in 5 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-config-declares-work.md:309:3: Sentence: A sentence holds 25 words. Cut this one in two."
  - step: verdict
    hand: box 2bc65ec92430 · claude-code-remote · helper-9
    hash_before: 87c377afcd51464dee1a3cde02a1e165e5075a93
    hash_after: 87c377afcd51464dee1a3cde02a1e165e5075a93
    returns: 1
    why: work-buttons.test.js asserts each button waits undrawn, and tree.test.js owns that fact already.; work-buttons.test.js asserts each button carries help, and tree.test.js owns that fact already.; Drop both asserts from work-buttons.test.js, and keep the icon and widget checks.
  - step: implement/reflect
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 5a7849afe3f776308828a533bc15f8f84ee0dc48
    hash_after: 5a7849afe3f776308828a533bc15f8f84ee0dc48
  - step: implement/change
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 74a83f8320b8b2c79dec7bb54368d44aca428124
    hash_after: 74a83f8320b8b2c79dec7bb54368d44aca428124
    answered:
      - name: lint
        exit: 0
        said: "test/contract/work-buttons.test.js:24:1: CodeComment: Code carries no comment here. Write a header of at most five lines"
  - step: implement/tests-green
    hand: box 2bc65ec92430 · claude-code-remote
    hash_before: 284b35821b77193f0db5536decc9b49ebffb371f
    hash_after: 284b35821b77193f0db5536decc9b49ebffb371f
    answered:
      - name: tests
        exit: 0
        said: green, 79 test(s) pass in 5 file(s)
      - name: check
        exit: 0
        said: "test/contract/work-buttons.test.js:24:1: CodeComment: Code carries no comment here. Write a header of at most five lines"
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

pass

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh test test/contract/work-buttons.test.js


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Every case fails on its own assertion. The cases read the declaration the tree ships, so they stand in a contract file, `test/contract/work-buttons.test.js`. The resolver cases in `test/level0/config.test.js` read a schema of their own, so the approach's line on that file moves here. `test/contract/tree.test.js` stands near the line ceiling, so its one edit stays the undrawn list.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The cases take a contract file of their own.
- every door the change reaches has a fake. The declaration is data, and the contract file reads the real disk door, as its neighbours do.
- a comment names the approach the change implements. The file opens on the design input it builds.


## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

The findings share one class: a new case asserted a fact another case owns already. The fix for the class is a search for the owning case before an assert lands. The new file keeps what it alone asserts, and a comment points at the owner of the rest.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The fix touches the new contract file alone.
- every door the change reaches has a fake. The fix reaches no door.
- a comment names the approach the change implements. A comment points at the case that owns the dropped asserts.


## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

./RUNME.sh lint spec/config/level0.schema.json test/contract/work-buttons.test.js test/contract/tree.test.js test/contract/sidebar.test.js test/level0/sidebar.test.js


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It touches the declaration, and the tests that read it.
- every door the change reaches has a fake. The change adds data alone, and no code reaches a door.
- a comment names the approach the change implements. The section comments say what each section holds now.


## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh test test/contract/work-buttons.test.js test/contract/tree.test.js test/contract/sidebar.test.js test/level0/sidebar.test.js test/level0/config.test.js


### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check


### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`spec/config/level0.schema.json` drops `engine.state` and `engine.beat`, which nothing read. The `work` section keeps its knobs and declares the work group's three buttons:

| the key | the button | what it declares |
|---|---|---|
| `work.editor` | the work editor | `runs` the work tab, and `counts` through `ticket yours --count` |
| `work.pull` | pull for me | `runs` `ticket yours --next`, whose ticket the host pulls and opens |
| `work.new` | new ticket | `asks` a name, and `opens` the file it names |

Each button carries no group, so the sidebar draws none of them yet. The desk group's host reads `counts` and `opens`, and its work group child adds the group.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. It touches the declaration and the tests that read it.
- every door the change reaches has a fake. The change reaches no door.
- a comment names the approach the change implements. The new contract file opens on the design input.


# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/tickets/the-config-declares-work.md
- spec/config/level0.schema.json
- test/contract/work-buttons.test.js
- test/contract/tree.test.js
- test/contract/sidebar.test.js
- test/level0/sidebar.test.js
- spec/design_input/the-editor-draws-the-ticket.md

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail
- work-buttons.test.js asserts each button waits undrawn, and tree.test.js owns that fact already.
- work-buttons.test.js asserts each button carries help, and tree.test.js owns that fact already.
- Drop both asserts from work-buttons.test.js, and keep the icon and widget checks.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact the change adds stands in one place. The undrawn and help facts stand twice, so the verdict fails.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
