---
kind: [[ticket]]
state: closed
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
          - name: size
            form: list
            says: every file the approach touches, one a line
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
        to: retro
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
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: code-is-pure-tests-behave
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: 927a3e3f3b4c6d8c72aba1aa5fbb991646cd1526
    hash_after: 927a3e3f3b4c6d8c72aba1aa5fbb991646cd1526
    inputs:
      - name: ask
        hash: d164b39d8d6d574f
        size: 655
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: e84844a5da102bfc20e6e8625ae02907077d6d5b
    hash_after: e84844a5da102bfc20e6e8625ae02907077d6d5b
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/imports fails
    inputs:
      - name: design/draft
        hash: b2d022c3033253b7
        size: 1440
      - name: [[spec/design_output/model]]
        hash: a1cec3f4220df26e
        size: 77706
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/model]]
  - step: design/tests-red
    hand: box 7b5a2726379b · claude-code-remote
    hash_before: 72c3bd155a6b9904fc8fc9a68f2f7a838d4abe11
    hash_after: bd3ca6a138060e3b7a9e872bd81ee11788973ae4
    why: black-box-tests-guard-reports answers this ask
reason: answered
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
Test code stays at or under the code it tests, per language and per module. The battery reads fast, and a change spends its lines on code. A module drifting past one to one shows before it grows.

<!-- breaks, as text: what breaks if it is never done -->
The JavaScript tests outgrow the JavaScript they test, and each change adds to the pile.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- a measure in the engine counts test lines and code lines per language and per module off the tracked tree
- the measure's test proves the counts on a planted tree
- a design output names how a test file maps to its module, for Go and for JavaScript
- `./RUNME.sh check` prints each module past one to one in report mode, with both counts, and stays green

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
none

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

[[spec/design_output/model#the-guards-hold-a-baseline]]. A pure function, `RatioOffenders`, in `src/imports/ratio.go` counts the lines holding text per module and language over the tracked files, and names each module whose test lines pass its code lines. An offender reads as its language and folder, then a tab and both counts. `Compare` keys on the text before the tab, so the baseline holds the module alone and a count change churns nothing. A guard entry `ratio` in `src/imports/guards.go` runs it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/imports/guards.go` `Guards`, which gains the entry
- `src/imports/guards.go` `Compare`, which keys on the text before a tab
- the guards verb in `src/quack/verb_guards.go`, which prints each offender whole

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/imports/ratio_test.go` `TestAModulePastOneToOneIsNamedWithBothCounts`
- `src/imports/ratio_test.go` `TestAJavaScriptTestBelongsToTheFolderItImports`
- `src/imports/guards_test.go` `TestACompareKeysOnTheTextBeforeATab`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/imports/ratio.go`
- `src/imports/ratio_test.go`
- `src/imports/guards.go`
- `src/imports/guards_test.go`
- `src/imports/baseline/ratio.txt`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the guards registry, `Compare` and the module terms in the guards section stand opened
- the callers line names the registry, the compare and the verb
- each done_when line meets a case: the counts, the module mapping and the report through the verb

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- `src/imports/ratio_test.go`
- `src/imports/guards_test.go`

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion over the stub. A JavaScript test importing no source lands in its own folder, which holds no code, so a pure harness file reads past one to one at once. That is the shape the ask wants cut.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red case: the counts, the module mapping, and the report through the guards verb
- the tests reach no door: they read a map

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# implement

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

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
