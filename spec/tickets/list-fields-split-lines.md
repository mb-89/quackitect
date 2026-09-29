---
kind: [[ticket]]
state: open
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
step: gate
group: loose-fixes-99f4547
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d84e33ce20f7 · claude-code-remote
    hash_before: a9d1f95bb1c8a3d43e44860f77ca4d8785ff8ee5
    hash_after: a9d1f95bb1c8a3d43e44860f77ca4d8785ff8ee5
    inputs:
      - name: ask
        hash: 05e7db43ad340a67
        size: 581
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d84e33ce20f7 · claude-code-remote
    hash_before: 6b48ecec417a46a47c63750b51a1d7dd7712a2b1
    hash_after: 6b48ecec417a46a47c63750b51a1d7dd7712a2b1
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 9ef7c2e96a66b47f
        size: 1411
    def: 08e16d07b0de477c
---

# Ask

A list field a hand-back carries as a JSON array lands on the ticket one item a line. Each reader of a list field then reads one item a row, as the red list does.

Today such an array lands as one line joined by commas. The red list then names one file that stands nowhere, and the check runs the red tests.

- a case in `test/level0/pull-fields.test.js` hands back a list field as an array, and the ticket carries one item a line
- a case there hands back the red list as an array, and `expectedRed` names each file
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

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

formatted in src/scripts/pull-format.js turns a field value into text with String, and String joins an array by commas. It now joins an array one item a line before its other rules run. withPayload in src/scripts/pull-chapter.js calls it for every field, so a list field handed back as an array lands one item a line, and redListOf reads each row as one file. Assumption: an array means a list, whatever form the field names, since a text field has no use for commas between items. Cost: a hand passing an array to a text field gets lines in place of commas.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/pull-chapter.js: withPayload, the one caller of formatted
src/scripts/pull.js: the hand-back, the one caller of withPayload
src/scripts/red-list.js: redListOf, which reads the rows formatted writes and stays unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/pull-fields.test.js: a list field handed back as an array lands one item a line
test/level0/pull-fields.test.js: a red list handed back as an array names each file to expectedRed

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first on a first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/scripts/pull-format.js
test/level0/pull-fields.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- formatted, withPayload, withFieldText and redListOf stand opened, and String over an array joins by commas
- the callers come off a grep of formatted and withPayload
- each done_when line names its case in pull-fields.test.js, and the check stays for tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-fields.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

test/level0/pull-fields.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The array case fails on its own assertion: the red field lands as one comma-joined line. The expectedRed case passes already, because this group split comma-joined red rows in redListOf to green the check. It stays as the guard on the reader side.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the array case decides the first done_when line and fails, the expectedRed case decides the second, and the check stays for tests-green
- withPayload and expectedRed read text alone, so the cases reach no door

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

This ticket waits on nobody. `design/owner-read` holds `when: handed`, and the ask says the source is none, so the next pull skips that step and hands out `design/draft`. The dispatch hands the ticket to a box like other open work.
